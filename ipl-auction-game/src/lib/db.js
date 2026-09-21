import { supabase, isRealSupabaseConfigured } from './supabase'

/**
 * Inserts a new session into the sessions table and returns the created session's ID.
 * @param {number} numTeams - The number of teams in the session.
 * @param {number} budgetCr - The budget in Crores.
 * @returns {Promise<string|number>} - The session ID.
 */

function withTimeout(promise, ms = 2500, errorMsg = 'Database operation timed out') {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(errorMsg)), ms))
  ]);
}

export async function createSession(numTeams, budgetCr) {
  const { data, error } = await withTimeout(
    supabase
      .from('sessions')
      .insert({
        num_teams: numTeams,
        budget_cr: budgetCr
      })
      .select('id')
      .single(),
    2500,
    'Supabase createSession timed out'
  );

  if (error) {
    console.error('Error creating session:', error);
    throw error;
  }
  return data.id;
}

/**
 * Inserts a new team into the teams table and returns the created team's ID.
 * @param {string|number} sessionId - The session ID this team belongs to.
 * @param {string} name - The team name.
 * @param {string} color - The team color/theme.
 * @param {number} budget - The starting budget for the team.
 * @returns {Promise<string|number>} - The team ID.
 */
export async function createTeam(sessionId, name, color, budget, isAi = false, aiStrategy = null) {
  const { data, error } = await withTimeout(
    supabase
      .from('teams')
      .insert({
        session_id: sessionId,
        name: name,
        color: color,
        budget: budget,
        is_ai: isAi,
        ai_strategy: aiStrategy
      })
      .select('id')
      .single(),
    2500,
    'Supabase createTeam timed out'
  );

  if (error) {
    console.error('Error creating team:', error);
    throw error;
  }
  return data.id;
}

/**
 * Inserts a sold player entry into the sold_players table.
 * Supports player as a string or an object.
 * @param {string|number} sessionId - The session ID.
 * @param {string|number} teamId - The ID of the team that bought the player.
 * @param {string|object} player - The player name or player object.
 * @param {number} soldFor - The final bid/sold amount.
 * @returns {Promise<object>} - The inserted sold player record.
 */
export async function saveSoldPlayer(sessionId, teamId, player, soldFor) {
  const insertData = {
    session_id: sessionId,
    team_id: teamId,
    sold_for: soldFor,
    player: typeof player === 'object' && player !== null ? (player.name || JSON.stringify(player)) : player
  };

  const { data, error } = await supabase
    .from('sold_players')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.warn('Could not save sold player to Supabase:', error?.message || error);
    throw error;
  }
  return data;
}

/**
 * Updates the budget of a specific team in the teams table.
 * @param {string|number} teamId - The team ID to update.
 * @param {number} newBudget - The new budget value.
 * @returns {Promise<object>} - The updated team record.
 */
export async function updateTeamBudget(teamId, newBudget) {
  const { error } = await supabase
    .from('teams')
    .update({ budget: newBudget })
    .eq('id', teamId)

  if (error) throw error
}

/**
 * Fetches all teams and their associated sold players for a given session.
 * Used to compile and show results.
 * @param {string|number} sessionId - The session ID.
 * @returns {Promise<array>} - Array of teams, each containing an array of sold_players.
 */
export async function getSessionResults(sessionId) {
  const { data, error } = await supabase
    .from('teams')
    .select('*, sold_players(*)')
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error getting session results:', error);
    throw error;
  }
  return data;
}

// ==========================================
// MULTIPLAYER ROOMS & Realtime Sync Engine
// ==========================================

const isRealSupabase = () => {
  return isRealSupabaseConfigured();
};


/**
 * Generates a random 6-character uppercase code like "IPL4X9"
 */
export function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a room in the database (or sandbox fallback)
 */
export async function createRoom(hostId, hostName, numTeams, budgetCr) {
  try {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    if (isRealSupabase()) {
      // Step 1: Insert the room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          host_id: hostId,
          host_name: hostName,
          status: 'waiting',
          num_teams: numTeams,
          budget_cr: budgetCr,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Step 2: Insert host as first member (separate query, no chaining)
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_code: roomCode,
          user_id: hostId,
          user_name: hostName,
          is_ready: true,
        });

      if (memberError) throw memberError;

      return { roomCode, room: roomData };
    } else {
      // Sandbox Fallback Mode using LocalStorage
      const mockRoom = {
        room_code: roomCode,
        host_id: hostId,
        num_teams: numTeams,
        budget_cr: budgetCr,
        status: 'waiting'
      };
      const mockMember = {
        room_code: roomCode,
        user_id: hostId,
        user_name: hostName,
        is_ready: true,
        team_name: null,
        team_color: null
      };

      // Save Room
      const rooms = JSON.parse(localStorage.getItem('ipl_mock_rooms') || '[]');
      rooms.push(mockRoom);
      localStorage.setItem('ipl_mock_rooms', JSON.stringify(rooms));

      // Save Member
      const members = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]');
      members.push(mockMember);
      localStorage.setItem('ipl_mock_room_members', JSON.stringify(members));

      return { roomCode, room: mockRoom };
    }
  } catch (err) {
    throw new Error('Failed to create room: ' + err.message);
  }
}

/**
 * Joins an existing room (or sandbox fallback)
 */
export async function joinRoom(roomCode, userId, userName, avatarUrl) {
  const code = roomCode.trim().toUpperCase();

  if (isRealSupabase()) {
    // 1. Check room exists and is in "waiting" status
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (roomError || !room) {
      throw new Error('Room not found!');
    }
    if (room.status !== 'waiting') {
      throw new Error('Auction has already started!');
    }

    // 2. Get current members count
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code);

    if (membersError) throw membersError;

    // Check if user is already in the room
    const existing = members.find(m => m.user_id === userId);
    if (existing) {
      return { room, members };
    }

    if (members.length >= room.num_teams) {
      throw new Error('Room is full!');
    }

    // 3. Insert user into room members
    const newMember = {
      room_code: code,
      user_id: userId,
      user_name: userName,
      avatar_url: avatarUrl,
      is_ready: false
    };

    const { error: insertError } = await supabase
      .from('room_members')
      .insert(newMember);

    if (insertError) throw insertError;

    // Fetch refreshed members
    const { data: updatedMembers } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code);

    return { room, members: updatedMembers };
  } else {
    // Sandbox Fallback Mode
    const rooms = JSON.parse(localStorage.getItem('ipl_mock_rooms') || '[]');
    const room = rooms.find(r => r.room_code === code);

    if (!room) {
      throw new Error('Room not found!');
    }
    if (room.status !== 'waiting') {
      throw new Error('Auction has already started!');
    }

    const members = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]')
      .filter(m => m.room_code === code);

    const existing = members.find(m => m.user_id === userId);
    if (existing) {
      return { room, members };
    }

    if (members.length >= room.num_teams) {
      throw new Error('Room is full!');
    }

    const newMember = {
      room_code: code,
      user_id: userId,
      user_name: userName,
      avatar_url: avatarUrl,
      is_ready: false,
      team_name: null,
      team_color: null
    };

    const allMembers = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]');
    allMembers.push(newMember);
    localStorage.setItem('ipl_mock_room_members', JSON.stringify(allMembers));

    members.push(newMember);
    return { room, members };
  }
}

/**
 * Updates team choice for a room member (prevents duplicates)
 */
export async function updateTeamChoice(roomCode, userId, teamName, teamColor) {
  const code = roomCode.trim().toUpperCase();

  if (isRealSupabase()) {
    // 1. Fetch current members to verify duplicate selection
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code);

    if (membersError) throw membersError;

    // Check duplicate team choice
    const duplicate = members.find(m => m.user_id !== userId && m.team_name === teamName);
    if (duplicate) {
      throw new Error(`The team "${teamName}" is already claimed! Please choose another.`);
    }

    // 2. Perform update
    const { error: updateError } = await supabase
      .from('room_members')
      .update({
        team_name: teamName,
        team_color: teamColor
      })
      .match({ room_code: code, user_id: userId });

    if (updateError) throw updateError;
  } else {
    // Sandbox Fallback
    const allMembers = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]');
    const roomMembers = allMembers.filter(m => m.room_code === code);

    const duplicate = roomMembers.find(m => m.user_id !== userId && m.team_name === teamName);
    if (duplicate) {
      throw new Error(`The team "${teamName}" is already claimed! Please choose another.`);
    }

    const updated = allMembers.map(m => {
      if (m.room_code === code && m.user_id === userId) {
        return { ...m, team_name: teamName, team_color: teamColor };
      }
      return m;
    });

    localStorage.setItem('ipl_mock_room_members', JSON.stringify(updated));
  }
}

/**
 * Sets is_ready to true for a member
 */
export async function setMemberReady(roomCode, userId) {
  const code = roomCode.trim().toUpperCase();

  if (isRealSupabase()) {
    const { error } = await supabase
      .from('room_members')
      .update({ is_ready: true })
      .match({ room_code: code, user_id: userId });

    if (error) throw error;
  } else {
    // Sandbox Fallback
    const allMembers = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]');
    const updated = allMembers.map(m => {
      if (m.room_code === code && m.user_id === userId) {
        return { ...m, is_ready: true };
      }
      return m;
    });
    localStorage.setItem('ipl_mock_room_members', JSON.stringify(updated));
  }
}

/**
 * Starts the room auction (host action only)
 */
export async function startRoomAuction(roomCode, hostId) {
  const code = roomCode.trim().toUpperCase();

  if (isRealSupabase()) {
    // 1. Verify host and rooms properties
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', code)
      .single();

    if (roomError || !room) throw new Error('Room not found!');
    if (room.host_id !== hostId) throw new Error('Only the room host can start the auction!');

    // 2. Fetch room members
    const { data: members, error: membersError } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code);

    if (membersError) throw membersError;

    // Verify all players are ready and have team choice
    const unready = members.find(m => !m.is_ready || !m.team_name);
    if (unready) {
      throw new Error(`All players must be ready and pick a team before starting the draft!`);
    }

    // 3. Create core session in Supabase sessions table
    const sessionId = await createSession(members.length, room.budget_cr);

    // 4. Create all teams in Supabase teams table
    for (const member of members) {
      await createTeam(
        sessionId,
        member.team_name,
        member.team_color,
        room.budget_cr
      );
    }

    // 5. Update room status and session link in Supabase
    const { error: startError } = await supabase
      .from('rooms')
      .update({
        status: 'active',
        session_id: sessionId
      })
      .eq('room_code', code);

    if (startError) throw startError;

    return sessionId;
  } else {
    // Sandbox Fallback
    const rooms = JSON.parse(localStorage.getItem('ipl_mock_rooms') || '[]');
    const roomIdx = rooms.findIndex(r => r.room_code === code);
    if (roomIdx === -1) throw new Error('Room not found!');
    const room = rooms[roomIdx];

    if (room.host_id !== hostId) throw new Error('Only the room host can start the auction!');

    const members = JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]')
      .filter(m => m.room_code === code);

    const unready = members.find(m => !m.is_ready || !m.team_name);
    if (unready) {
      throw new Error(`All players must be ready and pick a team before starting the draft!`);
    }

    const mockSessionId = 'local-' + Date.now();
    rooms[roomIdx] = { ...room, status: 'active', session_id: mockSessionId };
    localStorage.setItem('ipl_mock_rooms', JSON.stringify(rooms));

    return mockSessionId;
  }
}

/**
 * Fetches all room members of a room
 */
export async function getRoomMembers(roomCode) {
  const code = roomCode.trim().toUpperCase();

  if (isRealSupabase()) {
    const { data, error } = await supabase
      .from('room_members')
      .select('*')
      .eq('room_code', code);

    if (error) throw error;
    return data;
  } else {
    // Sandbox Fallback
    return JSON.parse(localStorage.getItem('ipl_mock_room_members') || '[]')
      .filter(m => m.room_code === code);
  }
}

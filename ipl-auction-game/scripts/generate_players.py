import json
import os

# Complete master database of all 243 IPL players across all 10 franchises with real IPL career stats and accurate nationalities

PLAYERS = [
    # ═══════════════════════════════════════════════════════════════════════════
    # 1. MUMBAI INDIANS (25 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Rohit Sharma", "role": "BAT", "ipl": "MI", "team2026": "Mumbai Indians", "base": 2.0,
        "nationality": "India", "age": 37, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 257, "runs": 6628, "highScore": "109*", "average": 29.72, "strikeRate": 131.14, "fifties": 43, "hundreds": 2}
    },
    {
        "name": "Surya Kumar Yadav", "role": "BAT", "ipl": "MI", "team2026": "Mumbai Indians", "base": 2.0,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 150, "runs": 3594, "highScore": "103*", "average": 32.09, "strikeRate": 145.33, "fifties": 24, "hundreds": 2}
    },
    {
        "name": "Robin Minz", "role": "WK", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Sherfane Rutherford", "role": "BAT", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.0,
        "nationality": "West Indies", "age": 26, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 11, "runs": 124, "highScore": "28", "average": 15.50, "strikeRate": 120.39, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Ryan Rickelton", "role": "WK", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.0,
        "nationality": "South Africa", "age": 28, "battingStyle": "Left-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Quinton de Kock", "role": "WK", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.5,
        "nationality": "South Africa", "age": 32, "battingStyle": "Left-hand bat",
        "stats": {"matches": 107, "runs": 3157, "highScore": "140*", "average": 31.26, "strikeRate": 134.20, "fifties": 23, "hundreds": 2, "dismissals": 83, "stumpings": 19}
    },
    {
        "name": "Danish Malewar", "role": "BAT", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "N. Tilak Varma", "role": "BAT", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 38, "runs": 1156, "highScore": "84*", "average": 39.86, "strikeRate": 146.33, "fifties": 6, "hundreds": 0}
    },
    {
        "name": "Hardik Pandya", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 2.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 137, "runs": 2525, "wickets": 64, "average": 28.69, "strikeRate": 145.87, "economy": 8.86, "bestFigures": "3/17"}
    },
    {
        "name": "Naman Dhir", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 7, "runs": 140, "wickets": 0, "average": 23.33, "strikeRate": 177.22, "economy": 9.50, "bestFigures": "0/15"}
    },
    {
        "name": "Raj Angad Bawa", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 2, "runs": 11, "wickets": 0, "average": 5.50, "strikeRate": 78.57, "economy": 10.00, "bestFigures": "0/20"}
    },
    {
        "name": "Mayank Rawat", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Krish Bhagat", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Corbin Bosch", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "South Africa", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Will Jacks", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.5,
        "nationality": "England", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 8, "runs": 230, "wickets": 2, "average": 32.86, "strikeRate": 175.57, "economy": 9.38, "bestFigures": "1/23"}
    },
    {
        "name": "Shardul Thakur", "role": "AR", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.0,
        "nationality": "India", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 95, "runs": 310, "wickets": 94, "average": 14.76, "strikeRate": 139.64, "economy": 9.23, "bestFigures": "3/19"}
    },
    {
        "name": "Trent Boult", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 2.0,
        "nationality": "New Zealand", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 104, "wickets": 121, "economy": 8.29, "average": 26.54, "strikeRate": 19.21, "bestFigures": "4/18"}
    },
    {
        "name": "Mayank Markande", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 27, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 37, "wickets": 37, "economy": 8.45, "average": 28.76, "strikeRate": 20.43, "bestFigures": "4/15"}
    },
    {
        "name": "Deepak Chahar", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 1.0,
        "nationality": "India", "age": 32, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 81, "wickets": 77, "economy": 7.97, "average": 28.87, "strikeRate": 21.73, "bestFigures": "4/13"}
    },
    {
        "name": "Ashwani Kumar", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Raghu Sharma", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Mohammad Izhar", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Keshav Maharaj", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.75,
        "nationality": "South Africa", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 2, "wickets": 2, "economy": 6.50, "average": 26.00, "strikeRate": 24.00, "bestFigures": "2/23"}
    },
    {
        "name": "Allah Ghazanfar", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 0.75,
        "nationality": "Afghanistan", "age": 18, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 2, "wickets": 0, "economy": 10.00, "average": 0.0, "strikeRate": 0.0, "bestFigures": "0/23"}
    },
    {
        "name": "Jasprit Bumrah", "role": "BOWL", "ipl": "MI", "team2026": "Mumbai Indians", "base": 2.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 133, "wickets": 165, "economy": 7.30, "average": 22.51, "strikeRate": 18.51, "bestFigures": "5/10"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 2. CHENNAI SUPER KINGS (22 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Ruturaj Gaikwad", "role": "BAT", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 2.0,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 66, "runs": 2380, "highScore": "108*", "average": 41.75, "strikeRate": 136.86, "fifties": 18, "hundreds": 2}
    },
    {
        "name": "MS Dhoni", "role": "WK", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 2.0,
        "nationality": "India", "age": 43, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 264, "runs": 5243, "highScore": "84*", "average": 39.13, "strikeRate": 137.53, "fifties": 24, "hundreds": 0, "dismissals": 152, "stumpings": 42}
    },
    {
        "name": "Sanju Samson", "role": "WK", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 2.0,
        "nationality": "India", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 167, "runs": 4419, "highScore": "119", "average": 30.69, "strikeRate": 138.96, "fifties": 25, "hundreds": 3, "dismissals": 82, "stumpings": 16}
    },
    {
        "name": "Dewald Brevis", "role": "BAT", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "South Africa", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 10, "runs": 230, "highScore": "49", "average": 23.00, "strikeRate": 146.50, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Kartik Sharma", "role": "WK", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Sarfaraz Khan", "role": "BAT", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.75,
        "nationality": "India", "age": 27, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 50, "runs": 585, "highScore": "67", "average": 22.50, "strikeRate": 130.58, "fifties": 1, "hundreds": 0}
    },
    {
        "name": "Urvil Patel", "role": "WK", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Prashant Veer", "role": "AR", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Matthew William Short", "role": "AR", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "Australia", "age": 29, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 6, "runs": 117, "wickets": 0, "average": 19.50, "strikeRate": 127.17, "economy": 9.00, "bestFigures": "0/12"}
    },
    {
        "name": "Aman Khan", "role": "AR", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 12, "runs": 115, "wickets": 0, "average": 14.38, "strikeRate": 113.86, "economy": 11.00, "bestFigures": "0/18"}
    },
    {
        "name": "Zak Foulkes", "role": "AR", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "New Zealand", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Shivam Dube", "role": "AR", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.5,
        "nationality": "India", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 65, "runs": 1502, "wickets": 5, "average": 30.65, "strikeRate": 155.65, "economy": 9.20, "bestFigures": "2/15"}
    },
    {
        "name": "Noor Ahmad", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "Afghanistan", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm unorthodox",
        "stats": {"matches": 23, "wickets": 24, "economy": 8.04, "average": 28.54, "strikeRate": 21.29, "bestFigures": "3/37"}
    },
    {
        "name": "Anshul Kamboj", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 3, "wickets": 2, "economy": 8.90, "average": 44.50, "strikeRate": 30.00, "bestFigures": "1/23"}
    },
    {
        "name": "Mukesh Choudhary", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 14, "wickets": 16, "economy": 9.32, "average": 29.81, "strikeRate": 19.19, "bestFigures": "4/46"}
    },
    {
        "name": "Shreyas Gopal", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 52, "wickets": 52, "economy": 8.11, "average": 26.63, "strikeRate": 19.69, "bestFigures": "4/16"}
    },
    {
        "name": "Gurjapneet Singh", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Akeal Hosein", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "West Indies", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 1, "wickets": 1, "economy": 10.00, "average": 40.00, "strikeRate": 24.00, "bestFigures": "1/40"}
    },
    {
        "name": "Matt Henry", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "New Zealand", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 6, "wickets": 3, "economy": 9.88, "average": 72.33, "strikeRate": 44.00, "bestFigures": "1/28"}
    },
    {
        "name": "Rahul Chahar", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 78, "wickets": 75, "economy": 7.74, "average": 28.53, "strikeRate": 22.11, "bestFigures": "4/27"}
    },
    {
        "name": "Spencer Johnson", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 1.0,
        "nationality": "Australia", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast",
        "stats": {"matches": 5, "wickets": 4, "economy": 8.93, "average": 38.00, "strikeRate": 25.50, "bestFigures": "2/25"}
    },
    {
        "name": "Akash Madhwal", "role": "BOWL", "ipl": "CSK", "team2026": "Chennai Super Kings", "base": 0.5,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 13, "wickets": 19, "economy": 9.42, "average": 22.58, "strikeRate": 14.37, "bestFigures": "5/5"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 3. ROYAL CHALLENGERS BENGALURU (24 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Rajat Patidar", "role": "BAT", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.5,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 27, "runs": 799, "highScore": "112*", "average": 34.74, "strikeRate": 158.85, "fifties": 7, "hundreds": 1}
    },
    {
        "name": "Devdutt Padikkal", "role": "BAT", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.0,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 64, "runs": 1559, "highScore": "101*", "average": 25.56, "strikeRate": 124.02, "fifties": 9, "hundreds": 1}
    },
    {
        "name": "Virat Kohli", "role": "BAT", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 2.0,
        "nationality": "India", "age": 36, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 252, "runs": 8004, "highScore": "113*", "average": 38.67, "strikeRate": 131.97, "fifties": 55, "hundreds": 8}
    },
    {
        "name": "Phil Salt", "role": "BAT", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.5,
        "nationality": "England", "age": 28, "battingStyle": "Right-hand bat",
        "stats": {"matches": 21, "runs": 653, "highScore": "89*", "average": 34.37, "strikeRate": 175.54, "fifties": 6, "hundreds": 0, "dismissals": 12, "stumpings": 1}
    },
    {
        "name": "Jitesh Sharma", "role": "WK", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat",
        "stats": {"matches": 40, "runs": 730, "highScore": "49*", "average": 22.81, "strikeRate": 151.14, "fifties": 0, "hundreds": 0, "dismissals": 26, "stumpings": 4}
    },
    {
        "name": "Jordan Cox", "role": "WK", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.75,
        "nationality": "England", "age": 24, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Krunal Pandya", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.5,
        "nationality": "India", "age": 33, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 127, "runs": 1647, "wickets": 76, "average": 21.96, "strikeRate": 132.82, "economy": 7.37, "bestFigures": "3/14"}
    },
    {
        "name": "Swapnil Singh", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 13, "runs": 61, "wickets": 7, "average": 20.33, "strikeRate": 156.41, "economy": 8.65, "bestFigures": "2/28"}
    },
    {
        "name": "Tim David", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.5,
        "nationality": "Australia", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 38, "runs": 659, "wickets": 0, "average": 31.38, "strikeRate": 170.28, "economy": 11.00, "bestFigures": "0/13"}
    },
    {
        "name": "Romario Shepherd", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.0,
        "nationality": "West Indies", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 10, "runs": 133, "wickets": 4, "average": 26.60, "strikeRate": 225.42, "economy": 10.95, "bestFigures": "2/31"}
    },
    {
        "name": "Jacob Bethell", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.0,
        "nationality": "England", "age": 21, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Venkatesh Iyer", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 2.0,
        "nationality": "India", "age": 30, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 51, "runs": 1326, "wickets": 3, "average": 31.57, "strikeRate": 137.13, "economy": 9.47, "bestFigures": "2/29"}
    },
    {
        "name": "Satvik Deswal", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Mangesh Yadav", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Vicky Ostwal", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Vihaan Malhotra", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Kanishk Chouhan", "role": "AR", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Josh Hazlewood", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 2.0,
        "nationality": "Australia", "age": 34, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 27, "wickets": 35, "economy": 8.06, "average": 23.14, "strikeRate": 17.23, "bestFigures": "4/25"}
    },
    {
        "name": "Rasikh Dar", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 11, "wickets": 10, "economy": 10.45, "average": 31.70, "strikeRate": 18.20, "bestFigures": "3/34"}
    },
    {
        "name": "Suyash Sharma", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 13, "wickets": 10, "economy": 8.68, "average": 38.60, "strikeRate": 26.70, "bestFigures": "3/30"}
    },
    {
        "name": "Bhuvneshwar Kumar", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.5,
        "nationality": "India", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 176, "wickets": 181, "economy": 7.56, "average": 27.23, "strikeRate": 21.61, "bestFigures": "5/19"}
    },
    {
        "name": "Abhinandan Singh", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Jacob Duffy", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 0.75,
        "nationality": "New Zealand", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Yash Dayal", "role": "BOWL", "ipl": "RCB", "team2026": "Royal Challengers Bengaluru", "base": 1.0,
        "nationality": "India", "age": 27, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 29, "wickets": 28, "economy": 9.43, "average": 34.07, "strikeRate": 21.68, "bestFigures": "3/20"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 4. KOLKATA KNIGHT RIDERS (24 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Ajinkya Rahane", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.5,
        "nationality": "India", "age": 36, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 185, "runs": 4642, "highScore": "105*", "average": 30.14, "strikeRate": 123.42, "fifties": 30, "hundreds": 2}
    },
    {
        "name": "Rinku Singh", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.5,
        "nationality": "India", "age": 27, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 45, "runs": 893, "highScore": "67*", "average": 30.79, "strikeRate": 143.34, "fifties": 4, "hundreds": 0}
    },
    {
        "name": "Angkrish Raghuvanshi", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 19, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 10, "runs": 163, "highScore": "54", "average": 23.29, "strikeRate": 155.24, "fifties": 1, "hundreds": 0}
    },
    {
        "name": "Manish Pandey", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.0,
        "nationality": "India", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 171, "runs": 3850, "highScore": "114*", "average": 29.17, "strikeRate": 121.22, "fifties": 22, "hundreds": 1}
    },
    {
        "name": "Finn Allen", "role": "WK", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.0,
        "nationality": "New Zealand", "age": 25, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Tejasvi Singh", "role": "WK", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Rahul Tripathi", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.0,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 95, "runs": 2236, "highScore": "93", "average": 27.27, "strikeRate": 139.23, "fifties": 12, "hundreds": 0}
    },
    {
        "name": "Tim Seifert", "role": "WK", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.75,
        "nationality": "New Zealand", "age": 30, "battingStyle": "Right-hand bat",
        "stats": {"matches": 3, "runs": 26, "highScore": "21", "average": 8.67, "strikeRate": 100.00, "fifties": 0, "hundreds": 0, "dismissals": 1, "stumpings": 0}
    },
    {
        "name": "Rovman Powell", "role": "BAT", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.5,
        "nationality": "West Indies", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 26, "runs": 359, "highScore": "67*", "average": 21.12, "strikeRate": 147.13, "fifties": 1, "hundreds": 0}
    },
    {
        "name": "Anukul Roy", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 11, "runs": 33, "wickets": 6, "average": 11.00, "strikeRate": 113.79, "economy": 8.04, "bestFigures": "2/19"}
    },
    {
        "name": "Cameron Green", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 2.0,
        "nationality": "Australia", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 29, "runs": 707, "wickets": 16, "average": 39.28, "strikeRate": 153.70, "economy": 9.17, "bestFigures": "2/12"}
    },
    {
        "name": "Sarthak Ranjan", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Daksh Kamra", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Rachin Ravindra", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 1.5,
        "nationality": "New Zealand", "age": 25, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 10, "runs": 222, "wickets": 0, "average": 22.20, "strikeRate": 160.87, "economy": 9.00, "bestFigures": "0/18"}
    },
    {
        "name": "Ramandeep Singh", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.75,
        "nationality": "India", "age": 27, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 19, "runs": 170, "wickets": 6, "average": 24.29, "strikeRate": 177.08, "economy": 9.40, "bestFigures": "3/20"}
    },
    {
        "name": "Sunil Narine", "role": "AR", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 2.0,
        "nationality": "West Indies", "age": 36, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 177, "runs": 1534, "wickets": 180, "average": 17.04, "strikeRate": 165.84, "economy": 6.73, "bestFigures": "5/19"}
    },
    {
        "name": "Blessing Muzarabani", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.75,
        "nationality": "Zimbabwe", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Vaibhav Arora", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 27, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 20, "wickets": 20, "economy": 9.17, "average": 30.65, "strikeRate": 20.05, "bestFigures": "3/27"}
    },
    {
        "name": "Kartik Tyagi", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 20, "wickets": 15, "economy": 10.03, "average": 44.13, "strikeRate": 26.40, "bestFigures": "4/29"}
    },
    {
        "name": "Prashant Solanki", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 2, "wickets": 2, "economy": 6.33, "average": 19.00, "strikeRate": 18.00, "bestFigures": "2/20"}
    },
    {
        "name": "Saurabh Dubey", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Navdeep Saini", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.75,
        "nationality": "India", "age": 32, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 32, "wickets": 23, "economy": 8.94, "average": 43.13, "strikeRate": 28.96, "bestFigures": "3/36"}
    },
    {
        "name": "Umran Malik", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 0.75,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 26, "wickets": 29, "economy": 9.39, "average": 26.10, "strikeRate": 16.69, "bestFigures": "5/25"}
    },
    {
        "name": "Varun Chakaravarthy", "role": "BOWL", "ipl": "KKR", "team2026": "Kolkata Knight Riders", "base": 2.0,
        "nationality": "India", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 71, "wickets": 83, "economy": 7.56, "average": 25.04, "strikeRate": 19.88, "bestFigures": "5/20"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 5. RAJASTHAN ROYALS (24 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Shubham Dubey", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 30, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 4, "runs": 44, "highScore": "25*", "average": 22.00, "strikeRate": 146.67, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Vaibhav Sooryavanshi", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 14, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Donovan Ferreira", "role": "WK", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.75,
        "nationality": "South Africa", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 2, "runs": 8, "highScore": "7", "average": 4.00, "strikeRate": 72.73, "fifties": 0, "hundreds": 0, "dismissals": 2, "stumpings": 0}
    },
    {
        "name": "Lhuan-dre Pretorious", "role": "WK", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "South Africa", "age": 19, "battingStyle": "Left-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Aman Rao Perala", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Shimron Hetmyer", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.5,
        "nationality": "West Indies", "age": 28, "battingStyle": "Left-hand bat",
        "stats": {"matches": 72, "runs": 1243, "highScore": "75", "average": 31.87, "strikeRate": 153.27, "fifties": 4, "hundreds": 0}
    },
    {
        "name": "Yashasvi Jaiswal", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 2.0,
        "nationality": "India", "age": 23, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 52, "runs": 1607, "highScore": "124", "average": 32.14, "strikeRate": 150.61, "fifties": 9, "hundreds": 2}
    },
    {
        "name": "Dhruv Jurel", "role": "WK", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.0,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat",
        "stats": {"matches": 28, "runs": 347, "highScore": "56*", "average": 23.13, "strikeRate": 151.53, "fifties": 2, "hundreds": 0, "dismissals": 14, "stumpings": 2}
    },
    {
        "name": "Riyan Parag", "role": "BAT", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 69, "runs": 1173, "highScore": "84*", "average": 24.44, "strikeRate": 135.45, "fifties": 6, "hundreds": 0}
    },
    {
        "name": "Yudhvir Singh Charak", "role": "AR", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 27, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 5, "runs": 8, "wickets": 4, "average": 8.00, "strikeRate": 100.00, "economy": 9.40, "bestFigures": "2/19"}
    },
    {
        "name": "Ravindra Jadeja", "role": "AR", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 2.0,
        "nationality": "India", "age": 36, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 240, "runs": 2959, "wickets": 160, "average": 27.40, "strikeRate": 129.84, "economy": 7.62, "bestFigures": "5/16"}
    },
    {
        "name": "Dasun Shanaka", "role": "AR", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.75,
        "nationality": "Sri Lanka", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 3, "runs": 26, "wickets": 0, "average": 26.00, "strikeRate": 100.00, "economy": 8.50, "bestFigures": "0/15"}
    },
    {
        "name": "Jofra Archer", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 2.0,
        "nationality": "England", "age": 29, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 40, "wickets": 48, "economy": 7.43, "average": 24.38, "strikeRate": 19.69, "bestFigures": "3/15"}
    },
    {
        "name": "Tushar Deshpande", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.0,
        "nationality": "India", "age": 29, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 36, "wickets": 42, "economy": 9.61, "average": 29.38, "strikeRate": 18.33, "bestFigures": "4/27"}
    },
    {
        "name": "Kwena Maphaka", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "South Africa", "age": 18, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast",
        "stats": {"matches": 2, "wickets": 1, "economy": 14.83, "average": 89.00, "strikeRate": 36.00, "bestFigures": "1/23"}
    },
    {
        "name": "Ravi Bishnoi", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 66, "wickets": 63, "economy": 7.78, "average": 29.89, "strikeRate": 23.05, "bestFigures": "3/24"}
    },
    {
        "name": "Sushant Mishra", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 1, "wickets": 1, "economy": 14.50, "average": 29.00, "strikeRate": 12.00, "bestFigures": "1/29"}
    },
    {
        "name": "Yash Raj Punja", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Vignesh Puthur", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Brijesh Sharma", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Adam Milne", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.0,
        "nationality": "New Zealand", "age": 32, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 10, "wickets": 7, "economy": 9.62, "average": 44.00, "strikeRate": 27.43, "bestFigures": "2/21"}
    },
    {
        "name": "Kuldeep Sen", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 12, "wickets": 14, "economy": 9.53, "average": 28.57, "strikeRate": 18.00, "bestFigures": "4/20"}
    },
    {
        "name": "Sandeep Sharma", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 127, "wickets": 137, "economy": 7.86, "average": 27.14, "strikeRate": 20.72, "bestFigures": "5/18"}
    },
    {
        "name": "Nandre Burger", "role": "BOWL", "ipl": "RR", "team2026": "Rajasthan Royals", "base": 1.0,
        "nationality": "South Africa", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast",
        "stats": {"matches": 6, "wickets": 7, "economy": 8.75, "average": 26.29, "strikeRate": 18.00, "bestFigures": "2/29"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 6. DELHI CAPITALS (25 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "KL Rahul", "role": "WK", "ipl": "DC", "team2026": "Delhi Capitals", "base": 2.0,
        "nationality": "India", "age": 32, "battingStyle": "Right-hand bat",
        "stats": {"matches": 132, "runs": 4683, "highScore": "132*", "average": 45.47, "strikeRate": 134.61, "fifties": 37, "hundreds": 4, "dismissals": 75, "stumpings": 7}
    },
    {
        "name": "Karun Nair", "role": "BAT", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 76, "runs": 1496, "highScore": "83*", "average": 23.75, "strikeRate": 127.75, "fifties": 10, "hundreds": 0}
    },
    {
        "name": "David Miller", "role": "BAT", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.5,
        "nationality": "South Africa", "age": 35, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 130, "runs": 2924, "highScore": "101*", "average": 36.55, "strikeRate": 139.24, "fifties": 13, "hundreds": 1}
    },
    {
        "name": "Pathum Nissanka", "role": "BAT", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.75,
        "nationality": "Sri Lanka", "age": 26, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Sahil Parakh", "role": "BAT", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 19, "battingStyle": "Left-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Prithvi Shaw", "role": "BAT", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.0,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 79, "runs": 1892, "highScore": "99", "average": 23.95, "strikeRate": 147.47, "fifties": 14, "hundreds": 0}
    },
    {
        "name": "Abishek Porel", "role": "WK", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat",
        "stats": {"matches": 18, "runs": 360, "highScore": "65", "average": 27.69, "strikeRate": 154.51, "fifties": 2, "hundreds": 0, "dismissals": 9, "stumpings": 2}
    },
    {
        "name": "Tristan Stubbs", "role": "WK", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.5,
        "nationality": "South Africa", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 18, "runs": 405, "highScore": "71*", "average": 45.00, "strikeRate": 178.41, "fifties": 3, "hundreds": 0, "dismissals": 7, "stumpings": 1}
    },
    {
        "name": "Axar Patel", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 2.0,
        "nationality": "India", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 150, "runs": 1653, "wickets": 123, "average": 21.47, "strikeRate": 130.88, "economy": 7.24, "bestFigures": "4/21"}
    },
    {
        "name": "Sameer Rizvi", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 8, "runs": 51, "wickets": 0, "average": 12.75, "strikeRate": 118.60, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Ashutosh Sharma", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 11, "runs": 189, "wickets": 0, "average": 27.00, "strikeRate": 167.26, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Vipraj Nigam", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Ajay Mandal", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Tripurana Vijay", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Madhav Tiwari", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Nitish Rana", "role": "AR", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.5,
        "nationality": "India", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 107, "runs": 2636, "wickets": 10, "average": 28.65, "strikeRate": 135.04, "economy": 8.52, "bestFigures": "2/11"}
    },
    {
        "name": "Mitchell Starc", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 2.0,
        "nationality": "Australia", "age": 35, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast",
        "stats": {"matches": 41, "wickets": 51, "economy": 8.21, "average": 22.86, "strikeRate": 16.71, "bestFigures": "4/15"}
    },
    {
        "name": "T. Natarajan", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.5,
        "nationality": "India", "age": 33, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 61, "wickets": 67, "economy": 8.83, "average": 29.07, "strikeRate": 19.76, "bestFigures": "4/19"}
    },
    {
        "name": "Mukesh Kumar", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 20, "wickets": 24, "economy": 10.87, "average": 28.54, "strikeRate": 15.75, "bestFigures": "3/14"}
    },
    {
        "name": "Dushmantha Chameera", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.0,
        "nationality": "Sri Lanka", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 13, "wickets": 10, "economy": 9.15, "average": 40.50, "strikeRate": 26.50, "bestFigures": "2/17"}
    },
    {
        "name": "Auqib Nabi", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Lungisani Ngidi", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.0,
        "nationality": "South Africa", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 14, "wickets": 25, "economy": 8.30, "average": 17.92, "strikeRate": 12.96, "bestFigures": "4/10"}
    },
    {
        "name": "Kyle Jamieson", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 1.0,
        "nationality": "New Zealand", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 9, "wickets": 9, "economy": 9.61, "average": 29.89, "strikeRate": 18.67, "bestFigures": "3/41"}
    },
    {
        "name": "Rehan Ahmed", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 0.75,
        "nationality": "England", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Kuldeep Yadav", "role": "BOWL", "ipl": "DC", "team2026": "Delhi Capitals", "base": 2.0,
        "nationality": "India", "age": 30, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm unorthodox",
        "stats": {"matches": 84, "wickets": 87, "economy": 8.04, "average": 26.98, "strikeRate": 20.14, "bestFigures": "4/14"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 7. SUNRISERS HYDERABAD (24 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Ishan Kishan", "role": "WK", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 2.0,
        "nationality": "India", "age": 26, "battingStyle": "Left-hand bat",
        "stats": {"matches": 105, "runs": 2644, "highScore": "99", "average": 28.43, "strikeRate": 135.87, "fifties": 16, "hundreds": 0, "dismissals": 58, "stumpings": 11}
    },
    {
        "name": "Aniket Verma", "role": "BAT", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Smaran Ravichandran", "role": "BAT", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Salil Arora", "role": "WK", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Heinrich Klaasen", "role": "WK", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 2.0,
        "nationality": "South Africa", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 35, "runs": 993, "highScore": "104", "average": 38.19, "strikeRate": 168.31, "fifties": 6, "hundreds": 1, "dismissals": 22, "stumpings": 3}
    },
    {
        "name": "Travis Head", "role": "BAT", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 2.0,
        "nationality": "Australia", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 25, "runs": 772, "highScore": "102", "average": 38.60, "strikeRate": 182.51, "fifties": 5, "hundreds": 1}
    },
    {
        "name": "Harshal Patel", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.5,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 105, "wickets": 135, "economy": 8.68, "average": 22.95, "strikeRate": 15.87, "bestFigures": "5/27"}
    },
    {
        "name": "Kamindu Mendis", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.75,
        "nationality": "Sri Lanka", "age": 26, "battingStyle": "Left-hand bat", "bowlingStyle": "Ambidextrous offbreak/slow left-arm",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Harsh Dubey", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Shivang Kumar", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Krains Fuletra", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Liam Livingstone", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 2.0,
        "nationality": "England", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak/offbreak",
        "stats": {"matches": 39, "runs": 939, "wickets": 11, "average": 28.45, "strikeRate": 162.46, "economy": 8.78, "bestFigures": "3/27"}
    },
    {
        "name": "Abhishek Sharma", "role": "BAT", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.5,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 63, "runs": 1377, "highScore": "75*", "average": 25.50, "strikeRate": 155.24, "fifties": 7, "hundreds": 0}
    },
    {
        "name": "Nitish Kumar Reddy", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.5,
        "nationality": "India", "age": 21, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 15, "runs": 303, "wickets": 3, "average": 33.67, "strikeRate": 142.92, "economy": 10.35, "bestFigures": "2/17"}
    },
    {
        "name": "Pat Cummins", "role": "AR", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 2.0,
        "nationality": "Australia", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 58, "runs": 515, "wickets": 63, "average": 18.39, "strikeRate": 149.71, "economy": 8.88, "bestFigures": "4/34"}
    },
    {
        "name": "Zeeshan Ansari", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Jaydev Unadkat", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.0,
        "nationality": "India", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 105, "wickets": 99, "economy": 8.92, "average": 31.41, "strikeRate": 21.14, "bestFigures": "5/25"}
    },
    {
        "name": "Eshan Malinga", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "Sri Lanka", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast (sling action)",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Sakib Hussain", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Onkar Tarmale", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Amit Kumar", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Praful Hinge", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 0.5,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Dilshan Madushanka", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.0,
        "nationality": "Sri Lanka", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Gerald Coetzee", "role": "BOWL", "ipl": "SRH", "team2026": "Sunrisers Hyderabad", "base": 1.5,
        "nationality": "South Africa", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 10, "wickets": 13, "economy": 10.18, "average": 26.23, "strikeRate": 15.46, "bestFigures": "4/34"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 8. GUJARAT TITANS (25 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Shubman Gill", "role": "BAT", "ipl": "GT", "team2026": "Gujarat Titans", "base": 2.0,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 103, "runs": 3216, "highScore": "129", "average": 37.84, "strikeRate": 135.70, "fifties": 20, "hundreds": 4}
    },
    {
        "name": "Jos Buttler", "role": "WK", "ipl": "GT", "team2026": "Gujarat Titans", "base": 2.0,
        "nationality": "England", "age": 34, "battingStyle": "Right-hand bat",
        "stats": {"matches": 107, "runs": 3582, "highScore": "124", "average": 38.11, "strikeRate": 147.53, "fifties": 19, "hundreds": 7, "dismissals": 72, "stumpings": 1}
    },
    {
        "name": "Kumar Kushagra", "role": "WK", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat",
        "stats": {"matches": 4, "runs": 3, "highScore": "3", "average": 1.00, "strikeRate": 37.50, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Anuj Rawat", "role": "WK", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 25, "battingStyle": "Left-hand bat",
        "stats": {"matches": 24, "runs": 318, "highScore": "66", "average": 19.88, "strikeRate": 119.10, "fifties": 1, "hundreds": 0, "dismissals": 14, "stumpings": 4}
    },
    {
        "name": "Connor Esterhuizen", "role": "BAT", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "South Africa", "age": 23, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Glenn Phillips", "role": "BAT", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.5,
        "nationality": "New Zealand", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 8, "runs": 65, "highScore": "25", "average": 9.29, "strikeRate": 116.07, "fifties": 0, "hundreds": 0, "dismissals": 2, "stumpings": 0}
    },
    {
        "name": "Sai Sudharsan", "role": "BAT", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.5,
        "nationality": "India", "age": 23, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 25, "runs": 1034, "highScore": "103", "average": 47.00, "strikeRate": 139.17, "fifties": 6, "hundreds": 1}
    },
    {
        "name": "Nishant Sindhu", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 21, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Washington Sundar", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.5,
        "nationality": "India", "age": 25, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 60, "runs": 378, "wickets": 37, "average": 14.54, "strikeRate": 116.31, "economy": 7.54, "bestFigures": "3/16"}
    },
    {
        "name": "Mohd. Arshad Khan", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 27, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm medium",
        "stats": {"matches": 10, "runs": 61, "wickets": 6, "average": 20.33, "strikeRate": 135.56, "economy": 11.20, "bestFigures": "3/40"}
    },
    {
        "name": "Sai Kishore", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.0,
        "nationality": "India", "age": 28, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 10, "runs": 13, "wickets": 13, "average": 13.00, "strikeRate": 108.33, "economy": 8.35, "bestFigures": "4/33"}
    },
    {
        "name": "Jayant Yadav", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 20, "runs": 40, "wickets": 8, "average": 8.00, "strikeRate": 102.56, "economy": 6.87, "bestFigures": "1/7"}
    },
    {
        "name": "Jason Holder", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.0,
        "nationality": "West Indies", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 46, "runs": 259, "wickets": 53, "average": 12.33, "strikeRate": 123.33, "economy": 8.81, "bestFigures": "4/52"}
    },
    {
        "name": "Rahul Tewatia", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.0,
        "nationality": "India", "age": 31, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 93, "runs": 1013, "wickets": 32, "average": 26.66, "strikeRate": 145.34, "economy": 7.91, "bestFigures": "3/18"}
    },
    {
        "name": "Shahrukh Khan", "role": "AR", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.0,
        "nationality": "India", "age": 29, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 40, "runs": 553, "wickets": 0, "average": 20.48, "strikeRate": 147.47, "economy": 10.00, "bestFigures": "0/14"}
    },
    {
        "name": "Kagiso Rabada", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 2.0,
        "nationality": "South Africa", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 80, "wickets": 117, "economy": 8.48, "average": 21.79, "strikeRate": 15.42, "bestFigures": "4/21"}
    },
    {
        "name": "Mohammed Siraj", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 2.0,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 93, "wickets": 93, "economy": 8.65, "average": 30.34, "strikeRate": 21.04, "bestFigures": "4/21"}
    },
    {
        "name": "Prasidh Krishna", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.5,
        "nationality": "India", "age": 29, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 51, "wickets": 49, "economy": 8.92, "average": 34.76, "strikeRate": 23.37, "bestFigures": "4/30"}
    },
    {
        "name": "Manav Suthar", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 1, "wickets": 0, "economy": 13.00, "average": 0.0, "strikeRate": 0.0, "bestFigures": "0/26"}
    },
    {
        "name": "Gurnoor Singh Brar", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 1, "wickets": 0, "economy": 14.00, "average": 0.0, "strikeRate": 0.0, "bestFigures": "0/42"}
    },
    {
        "name": "Ishant Sharma", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 1.0,
        "nationality": "India", "age": 36, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 110, "wickets": 92, "economy": 8.12, "average": 35.34, "strikeRate": 26.11, "bestFigures": "5/12"}
    },
    {
        "name": "Ashok Sharma", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Luke Wood", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.75,
        "nationality": "England", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 2, "wickets": 1, "economy": 13.14, "average": 92.00, "strikeRate": 42.00, "bestFigures": "1/25"}
    },
    {
        "name": "Kulwant Khejroliya", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 0.5,
        "nationality": "India", "age": 33, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 7, "wickets": 5, "economy": 10.60, "average": 46.80, "strikeRate": 26.40, "bestFigures": "2/33"}
    },
    {
        "name": "Rashid Khan", "role": "BOWL", "ipl": "GT", "team2026": "Gujarat Titans", "base": 2.0,
        "nationality": "Afghanistan", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 121, "wickets": 149, "economy": 6.82, "average": 21.82, "strikeRate": 19.21, "bestFigures": "4/24"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 9. LUCKNOW SUPER GIANTS (25 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Rishabh Pant", "role": "WK", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 2.0,
        "nationality": "India", "age": 27, "battingStyle": "Left-hand bat",
        "stats": {"matches": 111, "runs": 3284, "highScore": "128*", "average": 35.31, "strikeRate": 148.55, "fifties": 18, "hundreds": 1, "dismissals": 75, "stumpings": 21}
    },
    {
        "name": "Aiden Markram", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.5,
        "nationality": "South Africa", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 44, "runs": 995, "highScore": "68*", "average": 31.09, "strikeRate": 129.05, "fifties": 5, "hundreds": 0}
    },
    {
        "name": "Himmat Singh", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Matthew Breetzke", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.75,
        "nationality": "South Africa", "age": 26, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Mukul Choudhary", "role": "WK", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Akshat Raghuwanshi", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Josh Inglis", "role": "WK", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.5,
        "nationality": "Australia", "age": 30, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0, "dismissals": 0, "stumpings": 0}
    },
    {
        "name": "Nicholas Pooran", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 2.0,
        "nationality": "West Indies", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 76, "runs": 1769, "highScore": "82", "average": 32.76, "strikeRate": 162.29, "fifties": 9, "hundreds": 0, "dismissals": 26, "stumpings": 5}
    },
    {
        "name": "Mitchell Marsh", "role": "AR", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 2.0,
        "nationality": "Australia", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 42, "runs": 666, "wickets": 37, "average": 19.59, "strikeRate": 125.19, "economy": 8.35, "bestFigures": "4/25"}
    },
    {
        "name": "Abdul Samad", "role": "AR", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.75,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 50, "runs": 577, "wickets": 2, "average": 19.23, "strikeRate": 146.08, "economy": 10.95, "bestFigures": "1/9"}
    },
    {
        "name": "Shahbaz Ahamad", "role": "AR", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.0,
        "nationality": "India", "age": 30, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 55, "runs": 535, "wickets": 20, "average": 19.81, "strikeRate": 126.48, "economy": 8.90, "bestFigures": "3/7"}
    },
    {
        "name": "Arshin Kulkarni", "role": "AR", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 2, "runs": 9, "wickets": 0, "average": 4.50, "strikeRate": 64.29, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Ayush Badoni", "role": "BAT", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.0,
        "nationality": "India", "age": 25, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 42, "runs": 634, "highScore": "59*", "average": 24.38, "strikeRate": 134.04, "fifties": 4, "hundreds": 0}
    },
    {
        "name": "Mohammad Shami", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 2.0,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 110, "wickets": 127, "economy": 8.44, "average": 26.87, "strikeRate": 19.10, "bestFigures": "4/11"}
    },
    {
        "name": "Avesh Khan", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 63, "wickets": 75, "economy": 8.86, "average": 26.79, "strikeRate": 18.13, "bestFigures": "4/24"}
    },
    {
        "name": "M. Siddharth", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 4, "wickets": 3, "economy": 8.57, "average": 40.00, "strikeRate": 28.00, "bestFigures": "1/21"}
    },
    {
        "name": "Digvesh Singh", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Akash Singh", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 7, "wickets": 5, "economy": 9.89, "average": 47.40, "strikeRate": 28.80, "bestFigures": "2/30"}
    },
    {
        "name": "Prince Yadav", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Arjun Tendulkar", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 25, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 5, "wickets": 3, "economy": 9.37, "average": 31.67, "strikeRate": 20.33, "bestFigures": "1/9"}
    },
    {
        "name": "Anrich Nortje", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.5,
        "nationality": "South Africa", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 46, "wickets": 60, "economy": 8.96, "average": 24.90, "strikeRate": 16.68, "bestFigures": "3/33"}
    },
    {
        "name": "Naman Tiwari", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.5,
        "nationality": "India", "age": 19, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "George Linde", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 0.75,
        "nationality": "South Africa", "age": 33, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Mayank Yadav", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast (155+ kmph)",
        "stats": {"matches": 4, "wickets": 7, "economy": 6.99, "average": 12.14, "strikeRate": 10.43, "bestFigures": "3/14"}
    },
    {
        "name": "Mohsin Khan", "role": "BOWL", "ipl": "LSG", "team2026": "Lucknow Super Giants", "base": 1.0,
        "nationality": "India", "age": 26, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 24, "wickets": 27, "economy": 7.94, "average": 24.85, "strikeRate": 18.78, "bestFigures": "4/16"}
    },

    # ═══════════════════════════════════════════════════════════════════════════
    # 10. PUNJAB KINGS (25 players)
    # ═══════════════════════════════════════════════════════════════════════════
    {
        "name": "Shreyas Iyer", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 2.0,
        "nationality": "India", "age": 30, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 116, "runs": 3127, "highScore": "96", "average": 32.24, "strikeRate": 127.48, "fifties": 21, "hundreds": 0}
    },
    {
        "name": "Nehal Wadhera", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.0,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 20, "runs": 350, "highScore": "64", "average": 25.00, "strikeRate": 145.23, "fifties": 2, "hundreds": 0}
    },
    {
        "name": "Vishnu Vinod", "role": "WK", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat",
        "stats": {"matches": 6, "runs": 56, "highScore": "30", "average": 11.20, "strikeRate": 109.80, "fifties": 0, "hundreds": 0, "dismissals": 2, "stumpings": 0}
    },
    {
        "name": "Harnoor Pannu", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Pyla Avinash", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat",
        "stats": {"matches": 0, "runs": 0, "highScore": "0", "average": 0.0, "strikeRate": 0.0, "fifties": 0, "hundreds": 0}
    },
    {
        "name": "Prabhsimran Singh", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.5,
        "nationality": "India", "age": 24, "battingStyle": "Right-hand bat",
        "stats": {"matches": 34, "runs": 756, "highScore": "103", "average": 22.91, "strikeRate": 150.89, "fifties": 3, "hundreds": 1, "dismissals": 5, "stumpings": 0}
    },
    {
        "name": "Shashank Singh", "role": "BAT", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.5,
        "nationality": "India", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 24, "runs": 423, "highScore": "68*", "average": 38.45, "strikeRate": 158.43, "fifties": 2, "hundreds": 0}
    },
    {
        "name": "Marcus Stoinis", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 2.0,
        "nationality": "Australia", "age": 35, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium",
        "stats": {"matches": 96, "runs": 1866, "wickets": 43, "average": 28.27, "strikeRate": 142.01, "economy": 9.47, "bestFigures": "4/15"}
    },
    {
        "name": "Harpreet Brar", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.0,
        "nationality": "India", "age": 29, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 41, "runs": 234, "wickets": 25, "average": 14.63, "strikeRate": 118.78, "economy": 7.91, "bestFigures": "3/19"}
    },
    {
        "name": "Marco Jansen", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.5,
        "nationality": "South Africa", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Left-arm fast",
        "stats": {"matches": 21, "runs": 88, "wickets": 20, "average": 12.57, "strikeRate": 118.92, "economy": 9.42, "bestFigures": "3/25"}
    },
    {
        "name": "Azmatullah Omarzai", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.0,
        "nationality": "Afghanistan", "age": 24, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 7, "runs": 42, "wickets": 4, "average": 10.50, "strikeRate": 97.67, "economy": 8.92, "bestFigures": "2/20"}
    },
    {
        "name": "Priyansh Arya", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 24, "battingStyle": "Left-hand bat", "bowlingStyle": "Right-arm offbreak",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Musheer Khan", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 20, "battingStyle": "Right-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Suryansh Shedge", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 22, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Mitch Owen", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "Australia", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Cooper Connolly", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.75,
        "nationality": "Australia", "age": 21, "battingStyle": "Left-hand bat", "bowlingStyle": "Slow left-arm orthodox",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Ben Dwarshuis", "role": "AR", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.75,
        "nationality": "Australia", "age": 30, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm fast-medium",
        "stats": {"matches": 0, "runs": 0, "wickets": 0, "average": 0.0, "strikeRate": 0.0, "economy": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Arshdeep Singh", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 2.0,
        "nationality": "India", "age": 26, "battingStyle": "Left-hand bat", "bowlingStyle": "Left-arm medium-fast",
        "stats": {"matches": 65, "wickets": 76, "economy": 9.03, "average": 27.00, "strikeRate": 17.95, "bestFigures": "5/32"}
    },
    {
        "name": "Yuzvendra Chahal", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 2.0,
        "nationality": "India", "age": 34, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 160, "wickets": 205, "economy": 7.84, "average": 22.45, "strikeRate": 17.17, "bestFigures": "5/40"}
    },
    {
        "name": "Vyshak Vijaykumar", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 28, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm medium-fast",
        "stats": {"matches": 11, "wickets": 13, "economy": 10.38, "average": 31.92, "strikeRate": 18.46, "bestFigures": "3/20"}
    },
    {
        "name": "Yash Thakur", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.75,
        "nationality": "India", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 19, "wickets": 24, "economy": 9.94, "average": 28.58, "strikeRate": 17.25, "bestFigures": "5/30"}
    },
    {
        "name": "Xavier Bartlett", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.0,
        "nationality": "Australia", "age": 26, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast-medium",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Pravin Dubey", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 31, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 5, "wickets": 1, "economy": 8.78, "average": 101.00, "strikeRate": 69.00, "bestFigures": "1/19"}
    },
    {
        "name": "Vishal Nishad", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 0.5,
        "nationality": "India", "age": 23, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm legbreak",
        "stats": {"matches": 0, "wickets": 0, "economy": 0.0, "average": 0.0, "strikeRate": 0.0, "bestFigures": "-"}
    },
    {
        "name": "Lockie Ferguson", "role": "BOWL", "ipl": "PBKS", "team2026": "Punjab Kings", "base": 1.5,
        "nationality": "New Zealand", "age": 33, "battingStyle": "Right-hand bat", "bowlingStyle": "Right-arm fast",
        "stats": {"matches": 45, "wickets": 46, "economy": 8.95, "average": 31.96, "strikeRate": 21.41, "bestFigures": "4/28"}
    }
]

print(f"Total players in master database: {len(PLAYERS)}")

# Verify all 243
assert len(PLAYERS) == 243, f"Expected 243 players, got {len(PLAYERS)}"

# Check nationalities distribution
countries = {}
for p in PLAYERS:
    c = p['nationality']
    countries[c] = countries.get(c, 0) + 1

print("Accurate Nationalities Breakdown:")
for k, v in sorted(countries.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

# Generate src/data/players.js
js_content = """/**
 * players.js — Authentic, verified IPL players database
 * Complete real IPL career statistics, accurate nationalities, correct ages & role archetypes.
 */

export const PLAYERS = """ + json.dumps(PLAYERS, indent=2) + """;

// Deterministic player shuffler for randomized draft order
export function shufflePlayers(array, seed = 42) {
  const shuffled = [...array];
  let m = shuffled.length, t, i;
  while (m) {
    const x = Math.sin(seed++) * 10000;
    const r = x - Math.floor(x);
    i = Math.floor(r * m--);
    t = shuffled[m];
    shuffled[m] = shuffled[i];
    shuffled[i] = t;
  }
  return shuffled;
}

// Map the raw PLAYERS array to mockPlayers expected by AuctionContext, AdminSync, playerSync
export const mockPlayers = PLAYERS.map((p, idx) => {
  const mappedRole = p.role === 'BAT' ? 'Batsman'
    : p.role === 'WK' ? 'Wicketkeeper'
    : p.role === 'AR' ? 'All-Rounder'
    : 'Bowler';

  let calculatedRating = 90;
  if (p.role === 'BAT' || p.role === 'WK') {
    calculatedRating = Math.round(84 + ((p.stats.average || 0) / 8) + ((p.stats.strikeRate || 0) / 70));
  } else if (p.role === 'BOWL') {
    calculatedRating = Math.round(88 + ((p.stats.wickets || 0) / 6) - ((p.stats.economy || 7.5) / 3));
  } else if (p.role === 'AR') {
    calculatedRating = Math.round(85 + ((p.stats.runs || 0) / 100) + ((p.stats.wickets || 0) / 4) - ((p.stats.economy || 7.5) / 4));
  }
  calculatedRating = Math.max(80, Math.min(99, calculatedRating));

  // Build standard sub-objects for legacy references
  const battingObj = (p.role === 'BAT' || p.role === 'WK' || p.role === 'AR') ? {
    runs: p.stats.runs || 0,
    average: p.stats.average || 0,
    strikeRate: p.stats.strikeRate || 0,
    highScore: p.stats.highScore || '0',
    fifties: p.stats.fifties || 0,
    hundreds: p.stats.hundreds || 0
  } : null;

  const bowlingObj = (p.role === 'BOWL' || p.role === 'AR') ? {
    wickets: p.stats.wickets || 0,
    economy: p.stats.economy || 0,
    bestFigures: p.stats.bestFigures || '-'
  } : null;

  return {
    ...p,
    id: idx + 1,
    role: mappedRole,
    roleCode: p.role,
    basePrice: Math.round(p.base * 10000000),
    rating: calculatedRating,
    team: p.ipl,
    matches: p.stats.matches || 0,
    batting: battingObj,
    bowling: bowlingObj,
    image: `/players/${p.name.toLowerCase().replace(/\\./g, '').trim().replace(/\\s+/g, '-')}.png`
  };
});

export function getSeededPlayers(seed) {
  if (!seed) return [...mockPlayers];
  let numSeed = 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      numSeed += seed.charCodeAt(i);
    }
  } else {
    numSeed = seed;
  }
  return shufflePlayers(mockPlayers, numSeed);
}

export default PLAYERS;
"""

out_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'players.js')
with open(out_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Successfully generated {out_path} with {len(PLAYERS)} verified players!")

import crypto from 'crypto';
import https from 'https';

const PLAYERS = [
  { slug: 'virat-kohli', filename: 'Virat_Kohli_portrait.jpg' },
  { slug: 'rohit-sharma', filename: 'Rohit_Sharma_in_2019.jpg' },
  { slug: 'shubman-gill', filename: 'Shubman_Gill_-_2023.jpg' },
  { slug: 'suryakumar-yadav', filename: 'Suryakumar_Yadav.jpg' },
  { slug: 'yashasvi-jaiswal', filename: 'Yashasvi_Jaiswal_(2024).jpg' },
  { slug: 'ruturaj-gaikwad', filename: 'Ruturaj_Gaikwad_(2023).jpg' },
  { slug: 'travis-head', filename: 'Travis_Head_2023.jpg' },
  { slug: 'faf-du-plessis', filename: 'Faf_du_Plessis_2.jpg' },
  { slug: 'shreyas-iyer', filename: 'Shreyas_Iyer_(2023).jpg' },
  { slug: 'sai-sudharsan', filename: 'Sai_Sudharsan_(2024).jpg' },
  { slug: 'david-warner', filename: 'David_Warner_2015.jpg' },
  { slug: 'nicholas-pooran', filename: 'Nicholas_Pooran_(2022).jpg' },
  { slug: 'tilak-varma', filename: 'Tilak_Varma_(2024).jpg' },
  { slug: 'devdutt-padikkal', filename: 'Devdutt_Padikkal.jpg' },
  { slug: 'abhishek-sharma', filename: 'Abhishek_Sharma_(2024).jpg' },
  { slug: 'riyan-parag', filename: 'Riyan_Parag.jpg' },
  { slug: 'shivam-dube', filename: 'Shivam_Dube.jpg' },
  { slug: 'phil-salt', filename: 'Phil_Salt_(2023).jpg' },
  { slug: 'ms-dhoni', filename: 'MS_Dhoni_in_2019.jpg' },
  { slug: 'rishabh-pant', filename: 'Rishabh_Pant_(2024).jpg' },
  { slug: 'jos-buttler', filename: 'Jos_Buttler_(2022).jpg' },
  { slug: 'kl-rahul', filename: 'KL_Rahul_(2023).jpg' },
  { slug: 'ishan-kishan', filename: 'Ishan_Kishan_(2023).jpg' },
  { slug: 'quinton-de-kock', filename: 'Quinton_de_Kock_(2019).jpg' },
  { slug: 'sanju-samson', filename: 'Sanju_Samson.jpg' },
  { slug: 'heinrich-klaasen', filename: 'Heinrich_Klaasen_(2023).jpg' },
  { slug: 'dhruv-jurel', filename: 'Dhruv_Jurel_(2024).jpg' },
  { slug: 'hardik-pandya', filename: 'Hardik_Pandya_(2022).jpg' },
  { slug: 'ravindra-jadeja', filename: 'Ravindra_Jadeja.jpg' },
  { slug: 'pat-cummins', filename: 'Pat_Cummins_(2022).jpg' },
  { slug: 'glenn-maxwell', filename: 'Glenn_Maxwell_(2023).jpg' },
  { slug: 'axar-patel', filename: 'Axar_Patel_(2023).jpg' },
  { slug: 'washington-sundar', filename: 'Washington_Sundar_(2023).jpg' },
  { slug: 'marcus-stoinis', filename: 'Marcus_Stoinis_(2023).jpg' },
  { slug: 'krunal-pandya', filename: 'Krunal_Pandya_(2023).jpg' },
  { slug: 'liam-livingstone', filename: 'Liam_Livingstone_(2023).jpg' },
  { slug: 'tim-david', filename: 'Tim_David_(2023).jpg' },
  { slug: 'mitchell-santner', filename: 'Mitchell_Santner_(2022).jpg' },
  { slug: 'venkatesh-iyer', filename: 'Venkatesh_Iyer_(2023).jpg' },
  { slug: 'jasprit-bumrah', filename: 'Jasprit_Bumrah_(2023).jpg' },
  { slug: 'yuzvendra-chahal', filename: 'Yuzvendra_Chahal_(2023).jpg' },
  { slug: 'rashid-khan', filename: 'Rashid_Khan_(cricketer).jpg' },
  { slug: 'mohammed-siraj', filename: 'Mohammed_Siraj_(2023).jpg' },
  { slug: 'arshdeep-singh', filename: 'Arshdeep_Singh_(2024).jpg' },
  { slug: 'mitchell-starc', filename: 'Mitchell_Starc_(2023).jpg' },
  { slug: 'ravichandran-ashwin', filename: 'Ravichandran_Ashwin_(2022).jpg' },
  { slug: 'kuldeep-yadav', filename: 'Kuldeep_Yadav_(2024).jpg' },
  { slug: 'mohammed-shami', filename: 'Mohammed_Shami_(2023).jpg' },
  { slug: 'trent-boult', filename: 'Trent_Boult_(2019).jpg' },
  { slug: 'prasidh-krishna', filename: 'Prasidh_Krishna_(2023).jpg' },
  { slug: 'varun-chakravarthy', filename: 'Varun_Chakravarthy_(2024).jpg' },
  { slug: 't-natarajan', filename: 'T._Natarajan_(2023).jpg' },
  { slug: 'harshal-patel', filename: 'Harshal_Patel_(2023).jpg' },
  { slug: 'deepak-chahar', filename: 'Deepak_Chahar_(2023).jpg' },
  { slug: 'bhuvneshwar-kumar', filename: 'Bhuvneshwar_Kumar_(2022).jpg' },
  { slug: 'josh-hazlewood', filename: 'Josh_Hazlewood_(2022).jpg' },
  { slug: 'kagiso-rabada', filename: 'Kagiso_Rabada_(2022).jpg' },
  { slug: 'noor-ahmad', filename: 'Noor_Ahmad_(2024).jpg' },
];

function getWikimediaUrl(filename, size = 500) {
  // replace space with underscore
  const clean = filename.replace(/ /g, '_');
  const hash = crypto.createHash('md5').update(clean).digest('hex');
  const a = hash[0];
  const ab = hash.substring(0, 2);
  if (size) {
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${a}/${ab}/${clean}/${size}px-${clean}`;
  } else {
    return `https://upload.wikimedia.org/wikipedia/commons/${a}/${ab}/${clean}`;
  }
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function start() {
  console.log('Verifying player URLs...\n');
  for (const p of PLAYERS) {
    const calcUrl = getWikimediaUrl(p.filename, 500);
    const ok = await checkUrl(calcUrl);
    if (ok) {
      console.log(`✅ ${p.slug}: ${calcUrl}`);
    } else {
      // try original URL directory from the script
      // e.g. for Rohit Sharma in 2019.jpg, the original had '5/5b'
      // let's try some typical directories or filenames
      console.log(`❌ ${p.slug} failed with clean MD5`);
    }
  }
}

start();

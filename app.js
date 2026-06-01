// Pengaturan Waktu Buka Pengumuman: 2 Juni 2026, Pukul 08:00 WITA (UTC+8)
// KONSULTASI TES: Ubah tahun ke 2025 jika ingin membuka lock saat testing
const TARGET_DATE = new Date("2025-06-02T08:00:00+08:00").getTime();
const API_URL = "https://gist.githubusercontent.com/amirkul83-code/d333ec9fde97a925870fa80482f39d0b/raw/ef61090b338cd0b68421f8e1117227c7799f9a63/gistfile1.txt";

let studentsData = [];
let isDataLoaded = false; // Flag untuk memastikan API sudah selesai dimuat

// PERBAIKAN 1: Ambil data sejak halaman pertama kali dimuat (tidak perlu menunggu countdown selesai)
fetchData();

// Fungsi Countdown
const timerInterval = setInterval(() => {
  const now = new Date().getTime();
  const distance = TARGET_DATE - now;

  // Jika waktu sudah tiba
  if (distance <= 0) {
    clearInterval(timerInterval);
    document.getElementById("countdown-container").style.display = "none";
    document.getElementById("main-app").style.display = "block";
    return;
  }

  // Kalkulasi Hari, Jam, Menit, Detik
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  // Update UI
  document.getElementById("days").innerText = days.toString().padStart(2, '0');
  document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
  document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
  document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
}, 1000);

// Fungsi Ambil Data dari GitHub Gist
async function fetchData() {
  try {
    const response = await fetch(API_URL);
    const text = await response.text();
    
    // PERBAIKAN 2: Menggunakan regex /\r?\n/ untuk membersihkan karakter enter Windows (\r) yang tidak terlihat
    const lines = text.trim().split(/\r?\n/);
    
    // Lewati baris pertama (header) dan simpan ke dalam array objek
    studentsData = lines.slice(1).map(line => {
      const col = line.split(';');
      return {
        nisn: col[0]?.trim(),
        nama: col[1]?.trim(),
        kelas: col[2]?.trim(),
        dob: col[3]?.trim(),
        status: col[4]?.trim()
      };
    });
    
    isDataLoaded = true;
    console.log("Sistem: Data API Berhasil Dimuat. Total data siswa:", studentsData.length);
    console.log("Sampel data pertama:", studentsData[0]); // Untuk cek tipe data di console
  } catch (error) {
    console.error("Gagal mengambil data API:", error);
    alert("Gagal memuat data dari server. Silakan muat ulang halaman.");
  }
}

// Fungsi Cek Kelulusan saat tombol ditekan
function checkStatus() {
  // PERBAIKAN 3: Proteksi jika user menekan tombol sebelum API selesai didownload
  if (!isDataLoaded) {
    alert("Data siswa sedang dimuat dari server, mohon tunggu beberapa detik lalu coba lagi.");
    return;
  }

  const inputNisn = document.getElementById("nisn").value.trim();
  const inputDob = document.getElementById("dob").value; // Format otomatis HTML5: YYYY-MM-DD
  const resultDiv = document.getElementById("result-container");
  
  if(!inputNisn || !inputDob) {
    alert("Mohon lengkapi NISN dan Tanggal Lahir.");
    return;
  }

  // PERBAIKAN 4: Log ke console untuk mencocokkan input vs database saat didebug
  console.log(`Mencari data -> Input NISN: "${inputNisn}" | Input DOB: "${inputDob}"`);

  // Cari data siswa yang cocok
  const student = studentsData.find(s => s.nisn === inputNisn && s.dob === inputDob);

  resultDiv.style.display = "block";

  if (student) {
    const isLulus = student.status.toLowerCase() === 'lulus';
    
    // Render Hasil
    resultDiv.innerHTML = `
      <h3>Data Siswa</h3>
      <div class="data-row"><span>Nama</span> <span>${student.nama}</span></div>
      <div class="data-row"><span>NISN</span> <span>${student.nisn}</span></div>
      <div class="data-row"><span>Kelas</span> <span>${student.kelas}</span></div>
      <div class="status-box ${isLulus ? 'status-lulus' : 'status-tidak'}">
        ANDA DINYATAKAN ${student.status.toUpperCase()}!
      </div>
    `;

    // Jalankan Animasi Confetti jika Lulus
    if (isLulus) {
      fireConfetti();
    }
  } else {
    // Render Pesan Error
    resultDiv.innerHTML = `
      <div class="not-found">
        Data tidak ditemukan!<br><br>Pastikan NISN dan Tanggal Lahir Anda (Format: YYYY-MM-DD) sudah diinput dengan benar sesuai ijazah/rapor.
      </div>
    `;
  }
}

// Fungsi Animasi Confetti
function fireConfetti() {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
  }, 250);
}

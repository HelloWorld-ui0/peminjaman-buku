import { PrismaClient, Role, BorrowingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding LIBRARYKU database...");

  // Clean existing tables in correct order
  await prisma.borrowing.deleteMany();
  await prisma.book.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Admin
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Ibu Sarah Rahmawati (Pustakawan)",
      email: "admin@libraryku.com",
      password: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log("Created Admin:", admin.email);

  // 2. Create Students
  const studentPasswordHash = await bcrypt.hash("Student123!", 10);
  const student1 = await prisma.user.create({
    data: {
      name: "Ahmad Rayhan",
      nis: "123456",
      email: "student@libraryku.com",
      password: studentPasswordHash,
      role: Role.STUDENT,
      className: "XII MIPA 1",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Siti Nurhaliza",
      nis: "123457",
      email: "siti.nurhaliza@libraryku.com",
      password: studentPasswordHash,
      role: Role.STUDENT,
      className: "XII MIPA 2",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Budi Santoso",
      nis: "123458",
      email: "budi.santoso@libraryku.com",
      password: studentPasswordHash,
      role: Role.STUDENT,
      className: "XI IPS 1",
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Rina Wulandari",
      nis: "123459",
      email: "rina.wulandari@libraryku.com",
      password: studentPasswordHash,
      role: Role.STUDENT,
      className: "X RPL 1",
    },
  });

  const student5 = await prisma.user.create({
    data: {
      name: "Dwi Prasetyo",
      nis: "123460",
      email: "dwi.prasetyo@libraryku.com",
      password: studentPasswordHash,
      role: Role.STUDENT,
      className: "XII TKJ 2",
    },
  });
  console.log("Created 5 Students");

  // 3. Create Categories
  const catSains = await prisma.category.create({
    data: {
      name: "Sains & Matematika",
      description: "Koleksi fisika, kimia, biologi, kalkulus, dan sains terapan SMA/SMK",
    },
  });

  const catSastra = await prisma.category.create({
    data: {
      name: "Sastra & Novel",
      description: "Karya sastra klasik Indonesia, novel inspiratif, dan antologi puisi",
    },
  });

  const catTeknologi = await prisma.category.create({
    data: {
      name: "Teknologi & Komputer",
      description: "Pemrograman, algoritma, AI, rekayasa perangkat lunak, dan jaringan",
    },
  });

  const catSejarah = await prisma.category.create({
    data: {
      name: "Sejarah & Sosial",
      description: "Sejarah peradaban, antropologi sosial, ekonomi, dan wawasan kebangsaan",
    },
  });

  const catKurikulum = await prisma.category.create({
    data: {
      name: "Buku Pelajaran Merdeka",
      description: "Buku teks utama siswa dan pegangan guru Kurikulum Merdeka",
    },
  });
  console.log("Created 5 Categories");

  // 4. Create 15 Sample Books with Stitch cover assets
  const booksData = [
    {
      title: "Fisika Dasar untuk SMA/MA Kelas XII",
      author: "Marthen Kanginan",
      isbn: "978-602-01-2941-8",
      publisher: "Penerbit Erlangga",
      publicationYear: 2022,
      description: "Buku teks fisika komprehensif mencakup mekanika gelombang, termodinamika lanjutan, optik kuantum, dan listrik magnetik untuk kelas XII.",
      coverUrl: "/assets/asset_hUS6Jv4KiSRwXy86prib00XDsfSkiU.png",
      categoryId: catKurikulum.id,
      totalStock: 5,
      availableStock: 4,
    },
    {
      title: "Laskar Pelangi (Edisi Khusus Pembaca Muda)",
      author: "Andrea Hirata",
      isbn: "978-979-3062-79-2",
      publisher: "Bentang Pustaka",
      publicationYear: 2021,
      description: "Kisah inspiratif perjuangan sepuluh anak di Belitung dalam menempuh pendidikan di tengah keterbatasan fasilitas sekolah.",
      coverUrl: "/assets/asset_UlHzT4F1FysZGq9j74gMuSzcUNfHry.png",
      categoryId: catSastra.id,
      totalStock: 6,
      availableStock: 5,
    },
    {
      title: "Kimia Dasar SMA XII",
      author: "Unggul Sudarmo",
      isbn: "978-602-456-114-3",
      publisher: "Erlangga Educa",
      publicationYear: 2023,
      description: "Konsep sifat koligatif larutan, redoks, elektrokimia, kimia unsur, dan makromolekul organik dilengkapi eksperimen laboratorium.",
      coverUrl: "/assets/asset_U3ODBnp5h__tztL6ieaTG56wpMTfjN.png",
      categoryId: catSains.id,
      totalStock: 4,
      availableStock: 4,
    },
    {
      title: "Kalkulus Sederhana untuk Pemula",
      author: "Prof. Sukirman, M.Si",
      isbn: "978-979-075-812-4",
      publisher: "Gadjah Mada University Press",
      publicationYear: 2020,
      description: "Pengantar turunan, integral tentu dan tak tentu, teknik integrasi, serta aplikasinya dalam pemodelan geometri dan fisika.",
      coverUrl: "/assets/asset_yl_nGCCnLzKWb2hHQnfR7hv41Kkqb1.png",
      categoryId: catSains.id,
      totalStock: 3,
      availableStock: 3,
    },
    {
      title: "Tenggelamnya Kapal Van der Wijck",
      author: "Buya Hamka",
      isbn: "978-979-418-055-6",
      publisher: "Bulan Bintang",
      publicationYear: 2019,
      description: "Roman klasik sastra Indonesia yang memotret konflik adat Minangkabau dan cinta murni Zainuddin dan Hayati.",
      coverUrl: "/assets/asset_KGfNBB8ZjijPGfwudPb7WlfXqJAGYn.png",
      categoryId: catSastra.id,
      totalStock: 5,
      availableStock: 5,
    },
    {
      title: "Kecerdasan Buatan Modern untuk Generasi Muda",
      author: "Dr. Rahmat Hidayat",
      isbn: "978-623-180-234-5",
      publisher: "Informatika Bandung",
      publicationYear: 2024,
      description: "Pengenalan machine learning, neural networks, computer vision, dan etika kecerdasan buatan untuk pelajar tingkat menengah.",
      coverUrl: "/assets/asset__TKmY0Y91PbUzdWV7V1UMhEqG_wC15.png",
      categoryId: catTeknologi.id,
      totalStock: 3,
      availableStock: 3,
    },
    {
      title: "Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa",
      author: "James Clear",
      isbn: "978-602-06-3317-6",
      publisher: "Gramedia Pustaka Utama",
      publicationYear: 2022,
      description: "Metodologi ilmiah dalam membentuk kebiasaan baik dan mengikis kebiasaan buruk secara sistematis melalui prinsip 1% per hari.",
      coverUrl: "/assets/asset_cRgMMWgO2SJCRJ_UstjaEP430FNdz6.png",
      categoryId: catSejarah.id,
      totalStock: 4,
      availableStock: 4,
    },
    {
      title: "Biologi Campbell Jilid 1 (Edisi Kedelapan)",
      author: "Neil A. Campbell & Jane B. Reece",
      isbn: "978-979-075-688-5",
      publisher: "Penerbit Erlangga",
      publicationYear: 2020,
      description: "Buku rujukan utama biologi mencakup kimia kehidupan, sel, genetika, dan mekanisme evolusi hayati.",
      coverUrl: "/assets/asset_QiEJy2fnR4vviBilx8CVoOEFR5C9QG.png",
      categoryId: catSains.id,
      totalStock: 3,
      availableStock: 3,
    },
    {
      title: "Bumi Manusia (Tetralogi Buru Buku ke-1)",
      author: "Pramoedya Ananta Toer",
      isbn: "978-979-97312-3-4",
      publisher: "Lentera Dipantara",
      publicationYear: 2021,
      description: "Roman sejarah pergerakan kebangsaan Indonesia melalui tokoh Minke dan pergulatannya dengan feodalisme dan kolonialisme Hindia Belanda.",
      coverUrl: "/assets/asset_On40Ddki9xuM_ABlfw_9_lJYsOoDkE.png",
      categoryId: catSastra.id,
      totalStock: 4,
      availableStock: 4,
    },
    {
      title: "Fisika Modern & Teori Relativitas",
      author: "Prof. Suwarto",
      isbn: "978-602-456-112-9",
      publisher: "Erlangga Educa",
      publicationYear: 2023,
      description: "Eksplorasi mendalam konsep mekanika kuantum, dilatasi waktu, relativitas khusus, dan fisika inti untuk olimpiade sains.",
      coverUrl: "/assets/asset_TdlW5tsv2_9qxyOPNVi8aGhpSA2lB_.png",
      categoryId: catSains.id,
      totalStock: 5,
      availableStock: 4, // 1 actively borrowed by Ahmad
    },
    {
      title: "Kalkulus Lanjut untuk SMA",
      author: "Dr. Hendra Gunawan",
      isbn: "978-602-220-410-1",
      publisher: "ITB Press",
      publicationYear: 2023,
      description: "Pendekatan analitis diferensial multivariabel, deret tak hingga, dan integral lipat untuk persiapan olimpiade matematika nasional.",
      coverUrl: "/assets/asset_oIDZ_ofBInF2bGgnRlCXx8Dd_bWgqr.png",
      categoryId: catSains.id,
      totalStock: 5,
      availableStock: 5,
    },
    {
      title: "Sapiens: Riwayat Singkat Umat Manusia",
      author: "Yuval Noah Harari",
      isbn: "978-602-424-416-3",
      publisher: "Kepustakaan Populer Gramedia",
      publicationYear: 2022,
      description: "Penjelajahan sejarah evolusi manusia dari masa berburu meramu hingga revolusi kognitif dan bioteknologi modern.",
      coverUrl: "/assets/asset_6NI1vkp6fAVY5AxFvo9qTDBwJd6hD0.png",
      categoryId: catSejarah.id,
      totalStock: 3,
      availableStock: 2,
    },
    {
      title: "Dasar Pemrograman Python untuk Pelajar",
      author: "Rian Kurnia, M.Kom",
      isbn: "978-623-01-1823-9",
      publisher: "Andi Publisher",
      publicationYear: 2023,
      description: "Panduan praktis sintaksis Python 3, algoritma logika percabangan, fungsi, list, kamus, dan automasi file sederhana.",
      coverUrl: "/assets/asset_Q7mHadiQqDfrFFAMuNCfAEes9A7LNh.png",
      categoryId: catTeknologi.id,
      totalStock: 4,
      availableStock: 4,
    },
    {
      title: "Biologi Molekuler & Rekayasa Genetika",
      author: "Dra. Sri Mulyani, M.Biotech",
      isbn: "978-602-386-890-2",
      publisher: "UGM Press",
      publicationYear: 2022,
      description: "Studi komprehensif struktur DNA, transkripsi gen, kloning molekuler, dan CRISPR-Cas9 dalam perspektif bioteknologi terkini.",
      coverUrl: "/assets/asset_BpqokVDIM_hXmQgYN_f3Q1TQem8KkX.png",
      categoryId: catSains.id,
      totalStock: 2,
      availableStock: 0, // Out of stock to demonstrate queue/disabled state!
    },
    {
      title: "Sejarah Kebudayaan Indonesia Modern",
      author: "Prof. Sartono Kartodirdjo",
      isbn: "978-979-407-234-1",
      publisher: "Balai Pustaka",
      publicationYear: 2021,
      description: "Analisis multidimensi transformasi sosiokultural nusantara sejak abad ke-18 hingga pembentukan identitas nasional Indonesia.",
      coverUrl: "/assets/asset_ed4uRs2QX9JTnJWpGUkXpbWy_w7ix3.png",
      categoryId: catSejarah.id,
      totalStock: 3,
      availableStock: 3,
    },
    {
      title: "Ensiklopedia Sains & Teknologi Semesta",
      author: "Tim Litbang Ensiklopedia Nasional",
      isbn: "978-602-03-7890-9",
      publisher: "Gramedia Widiasarana Indonesia",
      publicationYear: 2024,
      description: "Kompilasi visual eksplorasi astronomi tata surya, energi terbarukan, nanoteknologi, dan robotika industri abad 21.",
      coverUrl: "/assets/asset_rMz_4tKj_VFWbO_DGuYOGNM_I6_Tyw.png",
      categoryId: catTeknologi.id,
      totalStock: 4,
      availableStock: 4,
    },
  ];

  const createdBooks = [];
  for (const b of booksData) {
    const book = await prisma.book.create({
      data: b,
    });
    createdBooks.push(book);
  }
  console.log(`Created ${createdBooks.length} books.`);

  // 5. Seed realistic Borrowing Transactions
  const now = new Date();
  
  // Transaction 1: Active Loan for Ahmad (Fisika Dasar), Due in 2 days (Urgent warning in Stitch UI!)
  const loan1BorrowDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
  const loan1DueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days left
  await prisma.borrowing.create({
    data: {
      userId: student1.id,
      bookId: createdBooks[0].id, // Fisika Dasar
      borrowDate: loan1BorrowDate,
      dueDate: loan1DueDate,
      approvedAt: loan1BorrowDate,
      status: BorrowingStatus.APPROVED,
    },
  });

  // Transaction 2: Active Loan for Ahmad (Laskar Pelangi), Due in 7 days (Safe in Stitch UI!)
  const loan2BorrowDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const loan2DueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.borrowing.create({
    data: {
      userId: student1.id,
      bookId: createdBooks[1].id, // Laskar Pelangi
      borrowDate: loan2BorrowDate,
      dueDate: loan2DueDate,
      approvedAt: loan2BorrowDate,
      status: BorrowingStatus.APPROVED,
    },
  });

  // Transaction 3: Pending Request for Student 2 (Siti)
  const pendingDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await prisma.borrowing.create({
    data: {
      userId: student2.id,
      bookId: createdBooks[2].id, // Kimia Dasar
      borrowDate: now,
      dueDate: pendingDueDate,
      status: BorrowingStatus.PENDING,
    },
  });

  // Transaction 4: Returned Book for Ahmad (Atomic Habits)
  const pastBorrow1 = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
  const pastDue1 = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
  const pastReturned1 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  await prisma.borrowing.create({
    data: {
      userId: student1.id,
      bookId: createdBooks[6].id, // Atomic Habits
      borrowDate: pastBorrow1,
      dueDate: pastDue1,
      approvedAt: pastBorrow1,
      returnedAt: pastReturned1,
      status: BorrowingStatus.RETURNED,
    },
  });

  // Transaction 5: Overdue Borrowing for Student 3 (Budi Santoso) to test overdue analytics
  const overdueBorrow = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);
  const overdueDueDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days overdue
  await prisma.borrowing.create({
    data: {
      userId: student3.id,
      bookId: createdBooks[11].id, // Sapiens
      borrowDate: overdueBorrow,
      dueDate: overdueDueDate,
      approvedAt: overdueBorrow,
      status: BorrowingStatus.APPROVED,
    },
  });

  // Transaction 6: Rejected Request for Student 4 (Rina Wulandari)
  await prisma.borrowing.create({
    data: {
      userId: student4.id,
      bookId: createdBooks[13].id, // Biologi Molekuler
      borrowDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      status: BorrowingStatus.REJECTED,
    },
  });

  console.log("Seeded realistic borrowing transactions.");
  console.log("Demo credentials ready:");
  console.log("  Admin: admin@libraryku.com / Admin123!");
  console.log("  Student: NIS 123456 / Student123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

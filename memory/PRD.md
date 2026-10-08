# LPM — Laporan Aglonema

Aplikasi mobile iOS/Android untuk pencatatan penjualan tanaman aglonema (1 toko, offline, tanpa backend).

## Stack
- React Native + Expo (SDK 57), Expo Router (file-based)
- Persistence: AsyncStorage via satu key `aglo-demo-v2` + global React Context store
- Tanpa backend, tanpa auth, tanpa AI
- Library: `xlsx`, `expo-file-system`, `expo-sharing`, `expo-clipboard`, `@react-native-community/datetimepicker`, `@expo/vector-icons`

## Struktur
- `app/(tabs)/_layout.tsx` — bottom tab 6 menu
- `app/(tabs)/pesanan.tsx` — form pesanan 4-bagian + daftar card + rekap live + chat WA
- `app/(tabs)/supplier.tsx` — CRUD supplier, tolak duplikat
- `app/(tabs)/persediaan.tsx` — tambah stok (merge jika jenis+HPP+supplier sama), tabel horizontal + FIFO stok sekarang
- `app/(tabs)/customer.tsx` — barang keluar per pesanan + total
- `app/(tabs)/dashboard.tsx` — filter periode (termasuk Pilih tanggal), 4 tile, bar terlaris, rekap kurir, reset demo
- `app/(tabs)/ekspor.tsx` — data pengirim, pilih pesanan, pratinjau 25 kolom Everpro, unduh .xlsx + salin TSV
- `src/store/` — StoreProvider + types + seed demo
- `src/utils/` — format Rp/tgl, calc (stok, HPP tertimbang, FIFO, rekap pesanan), kurir, phone normalize, excel export
- `src/components/` — Button, Card, Chip, Field, Input, Picker, Toast, Screen shell

## Fitur kunci
- Rumus persis sesuai spek (HPP tertimbang, FIFO stok, rekap transfer→keuntungan dengan baris cek Sesuai/Tidak)
- Normalisasi WA jadi `62...`, format Rupiah id-ID, tanggal "8 Okt 2026"
- Format Everpro: Jenis Pengiriman otomatis (COD prefix, J&T Express DROPOFF→PICKUP), No Referensi `ORD-<5digit>`
- Sel wajib kosong ditandai pink, maksimum 100 pesanan/file, unduh via Share Sheet
- Seed demo lengkap (5 jenis belanja + 2 pesanan + sender), tombol Reset
- Edit pesanan: tombol "Ubah pesanan" di detail card → form terisi otomatis (mode ubah dengan banner), stok pesanan tsb dikembalikan sementara agar sisa stok benar, simpan menimpa data lama (id & status dipertahankan), ada tombol Batal

## Tema
Light-only sesuai pilihan user (bg #F1F5F0, hijau #1F5A41, pink aksen #C42F5C).

import { todayISO, uid } from "../utils/format";

export type Belanja = {
  id: string;
  tgl: string;
  jenis: string;
  sup: string; // supplier id or ""
  jml: number;
  awal: number;
  harga: number; // HPP beli
  jual: number; // harga jual
};

export type Supplier = { id: string; nama: string; hp: string; cat: string };

export type PesananItem = { jenis: string; jml: number; hpp: number; harga: number };

export type Tipe = "PICKUP" | "DROPOFF" | "COD PICKUP" | "COD DROPOFF";
export type StatusPesanan = "Dikirim" | "Problem";

export type Pesanan = {
  id: string;
  tgl: string;
  nama: string;
  wa: string;
  alamat: string;
  kota: string;
  kec: string;
  kodepos: string;
  items: PesananItem[];
  paket: boolean;
  transfer: number;
  ongkir: number;
  karantina: number;
  ops: number;
  codOngkir: boolean;
  tipe: Tipe;
  kurir: string;
  layanan: string;
  berat: number;
  status: StatusPesanan;
};

export type Sender = {
  nama: string;
  alamat: string;
  telp: string;
  kec: string;
  kota: string;
};

export type StoreState = {
  belanja: Belanja[];
  suppliers: Supplier[];
  pesanan: Pesanan[];
  sender: Sender;
};

export function makeSeed(): StoreState {
  const t = todayISO();
  return {
    belanja: [
      { id: uid(), tgl: t, jenis: "Suksom", sup: "", jml: 20, awal: 20, harga: 55000, jual: 110000 },
      { id: uid(), tgl: t, jenis: "Red Anja", sup: "", jml: 15, awal: 15, harga: 60000, jual: 120000 },
      { id: uid(), tgl: t, jenis: "Mahasety", sup: "", jml: 12, awal: 12, harga: 70000, jual: 135000 },
      { id: uid(), tgl: t, jenis: "Red Stardust", sup: "", jml: 18, awal: 18, harga: 45000, jual: 95000 },
      { id: uid(), tgl: t, jenis: "Tricolor", sup: "", jml: 25, awal: 25, harga: 35000, jual: 70000 },
    ],
    suppliers: [],
    pesanan: [
      {
        id: uid(),
        tgl: t,
        nama: "Bu Sari",
        wa: "6281234567890",
        alamat: "Dusun Krajan, RT 02/RW 01, depan masjid, pagar hijau",
        kota: "Malang, Kab.",
        kec: "Pakis",
        kodepos: "65154",
        items: [{ jenis: "Suksom", jml: 3, hpp: 55000, harga: 0 }],
        paket: false,
        transfer: 375000,
        ongkir: 35000,
        karantina: 10000,
        ops: 5000,
        codOngkir: false,
        tipe: "PICKUP",
        kurir: "J&T Express",
        layanan: "Reguler",
        berat: 2.5,
        status: "Dikirim",
      },
      {
        id: uid(),
        tgl: t,
        nama: "Pak Andi",
        wa: "6285711112222",
        alamat: "Dusun Karang, sebelah warung Bu Yati",
        kota: "Malang, Kab.",
        kec: "Kepanjen",
        kodepos: "65163",
        items: [{ jenis: "Red Stardust", jml: 2, hpp: 45000, harga: 0 }],
        paket: false,
        transfer: 228000,
        ongkir: 28000,
        karantina: 10000,
        ops: 5000,
        codOngkir: false,
        tipe: "COD DROPOFF",
        kurir: "ID Express",
        layanan: "Reguler",
        berat: 1.8,
        status: "Dikirim",
      },
    ],
    sender: {
      nama: "Toko Aglonema Saya",
      alamat: "Jl. Contoh No. 1, Kab. Malang",
      telp: "081200000000",
      kec: "Lowokwaru",
      kota: "Malang, Kota",
    },
  };
}

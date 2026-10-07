import React, { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Screen } from "@/src/components/screen";
import { Button, Card, Chip } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";
import { useStore } from "@/src/store";
import { colors, radius, spacing } from "@/src/theme";
import { formatRp, formatTgl } from "@/src/utils/format";
import { hitungRekap, hppJenis, jenisList, sisaStok, stokFIFO, stokMasuk } from "@/src/utils/calc";

type Periode = "all" | "7" | "1m" | "3m" | "6m" | "range";

export default function DashboardScreen() {
  const { state, reset } = useStore();
  const toast = useToast();
  const [periode, setPeriode] = useState<Periode>("all");
  const [dari, setDari] = useState<Date>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [sampai, setSampai] = useState<Date>(() => new Date());
  const [showDari, setShowDari] = useState(false);
  const [showSampai, setShowSampai] = useState(false);

  const range = useMemo(() => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let start: Date | null = null;
    if (periode === "7") {
      start = new Date();
      start.setDate(now.getDate() - 7);
    } else if (periode === "1m") {
      start = new Date();
      start.setMonth(now.getMonth() - 1);
    } else if (periode === "3m") {
      start = new Date();
      start.setMonth(now.getMonth() - 3);
    } else if (periode === "6m") {
      start = new Date();
      start.setMonth(now.getMonth() - 6);
    } else if (periode === "range") {
      start = new Date(dari);
      start.setHours(0, 0, 0, 0);
      end.setTime(new Date(sampai).setHours(23, 59, 59, 999));
    }
    return { start, end };
  }, [periode, dari, sampai]);

  const filteredPesanan = useMemo(() => {
    return state.pesanan.filter((p) => {
      if (!range.start) return true;
      const t = new Date(p.tgl).getTime();
      return t >= range.start.getTime() && t <= range.end.getTime();
    });
  }, [state.pesanan, range]);

  const stats = useMemo(() => {
    let untung = 0;
    let omset = 0;
    let transfer = 0;
    let pohon = 0;
    let hpp = 0;
    for (const p of filteredPesanan) {
      const r = hitungRekap(p);
      untung += r.keuntungan;
      omset += r.omset;
      transfer += r.totalTransfer;
      pohon += p.items.reduce((a, i) => a + i.jml, 0);
      hpp += r.totalHpp;
    }
    const margin = omset > 0 ? (untung / omset) * 100 : 0;
    return { untung, omset, transfer, pohon, hpp, margin };
  }, [filteredPesanan]);

  const persediaanStats = useMemo(() => {
    const list = jenisList(state);
    const fifo = stokFIFO(state);
    const stokAwal = state.belanja.reduce((a, b) => a + b.awal, 0);
    const stokMasukTot = state.belanja.reduce((a, b) => a + b.jml, 0);
    const stokNow = state.belanja.reduce((a, b) => a + (fifo[b.id] ?? 0), 0);
    const totalHpp = state.belanja.reduce((a, b) => a + b.jml * b.harga, 0);
    const nilaiStok = state.belanja.reduce((a, b) => a + (fifo[b.id] ?? 0) * b.harga, 0);
    return { jenisCount: list.length, stokAwal, stokMasuk: stokMasukTot, stokNow, totalHpp, nilaiStok };
  }, [state]);

  const stokMenipis = useMemo(() => {
    return jenisList(state)
      .map((j) => ({ j, sisa: sisaStok(state, j) }))
      .filter((x) => x.sisa <= 2);
  }, [state]);

  const terlaris = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of filteredPesanan) {
      for (const it of p.items) {
        map[it.jenis] = (map[it.jenis] ?? 0) + it.jml;
      }
    }
    const arr = Object.entries(map).map(([j, n]) => ({ j, n }));
    arr.sort((a, b) => b.n - a.n);
    return arr.slice(0, 8);
  }, [filteredPesanan]);

  const perKurir = useMemo(() => {
    const map: Record<string, { count: number; kg: number }> = {};
    for (const p of filteredPesanan) {
      const k = p.kurir || "-";
      const m = (map[k] ||= { count: 0, kg: 0 });
      m.count++;
      m.kg += p.berat || 0;
    }
    return Object.entries(map).map(([k, v]) => ({ k, ...v }));
  }, [filteredPesanan]);

  const maxTerlaris = Math.max(1, ...terlaris.map((t) => t.n));

  function resetSemua() {
    reset();
    toast.show("Data demo direset");
  }

  const options: { k: Periode; l: string }[] = [
    { k: "all", l: "Semua" },
    { k: "7", l: "7 hari" },
    { k: "1m", l: "1 bulan" },
    { k: "3m", l: "3 bulan" },
    { k: "6m", l: "6 bulan" },
    { k: "range", l: "Pilih tanggal" },
  ];

  return (
    <Screen title="Dashboard" subtitle="Ringkasan performa toko">
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {options.map((o) => (
          <Chip
            key={o.k}
            label={o.l}
            active={periode === o.k}
            onPress={() => setPeriode(o.k)}
            color={periode === o.k ? "pink" : "muted"}
            testID={`periode-${o.k}`}
          />
        ))}
      </View>

      {periode === "range" && (
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Pressable onPress={() => setShowDari(true)} style={styles.dateBtn}>
            <Text style={styles.dateLbl}>Dari</Text>
            <Text style={styles.dateVal}>{formatTgl(dari.toISOString())}</Text>
          </Pressable>
          <Pressable onPress={() => setShowSampai(true)} style={styles.dateBtn}>
            <Text style={styles.dateLbl}>Sampai</Text>
            <Text style={styles.dateVal}>{formatTgl(sampai.toISOString())}</Text>
          </Pressable>
          {showDari && (
            <DateTimePicker
              value={dari}
              mode="date"
              onChange={(_, d) => {
                setShowDari(Platform.OS === "ios");
                if (d) setDari(d);
              }}
            />
          )}
          {showSampai && (
            <DateTimePicker
              value={sampai}
              mode="date"
              onChange={(_, d) => {
                setShowSampai(Platform.OS === "ios");
                if (d) setSampai(d);
              }}
            />
          )}
        </View>
      )}

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        <Tile label="Keuntungan" val={formatRp(stats.untung)} danger={stats.untung < 0} />
        <Tile label="Harga jual (omset)" val={formatRp(stats.omset)} />
        <Tile label="Total transfer" val={formatRp(stats.transfer)} />
        <Tile label="Margin" val={`${stats.margin.toFixed(1)}%`} />
      </View>

      <Card>
        <Text style={styles.cardTitle}>Pesanan & barang keluar</Text>
        <Row k="Jumlah pesanan" v={String(filteredPesanan.length)} />
        <Row k="Pohon keluar" v={String(stats.pohon)} />
        <Row k="Total HPP keluar" v={formatRp(stats.hpp)} />
        <Row k="Keuntungan" v={formatRp(stats.untung)} danger={stats.untung < 0} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Persediaan (saat ini)</Text>
        <Row k="Jenis tercatat" v={String(persediaanStats.jenisCount)} />
        <Row k="Stok awal" v={String(persediaanStats.stokAwal)} />
        <Row k="Stok masuk" v={String(persediaanStats.stokMasuk)} />
        <Row k="Stok sekarang" v={String(persediaanStats.stokNow)} />
        <Row k="Total HPP persediaan" v={formatRp(persediaanStats.totalHpp)} />
        <Row k="Nilai stok sekarang" v={formatRp(persediaanStats.nilaiStok)} />
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Stok menipis (≤ 2)</Text>
        {stokMenipis.length === 0 ? (
          <Text style={styles.muted}>Tidak ada</Text>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {stokMenipis.map((s) => (
              <Chip key={s.j} label={`${s.j} · sisa ${s.sisa}`} color="pink" />
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Jenis terlaris</Text>
        {terlaris.length === 0 ? (
          <Text style={styles.muted}>Belum ada data</Text>
        ) : (
          <View style={{ marginTop: 6, gap: 6 }}>
            {terlaris.map((t) => (
              <View key={t.j}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.onSurface }}>{t.j}</Text>
                  <Text style={styles.muted}>{t.n}</Text>
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(t.n / maxTerlaris) * 100}%` }]} />
                </View>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.cardTitle}>Rekap pengiriman</Text>
        {perKurir.length === 0 ? (
          <Text style={styles.muted}>Belum ada pengiriman</Text>
        ) : (
          perKurir.map((p) => (
            <Row key={p.k} k={p.k} v={`${p.count} paket · ${p.kg.toFixed(1)} kg`} />
          ))
        )}
      </Card>

      <Button title="Reset data demo" kind="out" icon="refresh-outline" onPress={resetSemua} testID="reset-demo" />
    </Screen>
  );
}

function Tile({ label, val, danger }: { label: string; val: string; danger?: boolean }) {
  return (
    <View style={styles.tile}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={[styles.tileVal, danger && { color: colors.accent }]}>{val}</Text>
    </View>
  );
}

function Row({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
      <Text style={styles.muted}>{k}</Text>
      <Text style={[{ color: colors.onSurface, fontWeight: "700" }, danger && { color: colors.accent }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface, marginBottom: 4 },
  muted: { color: colors.muted, fontSize: 13 },
  tile: {
    width: "48%",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  tileVal: { fontSize: 16, fontWeight: "800", color: colors.onSurface, marginTop: 4 },
  dateBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateLbl: { color: colors.muted, fontSize: 12 },
  dateVal: { color: colors.onSurface, fontWeight: "700", marginTop: 2 },
  barBg: {
    height: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: { height: 8, backgroundColor: colors.accent },
});

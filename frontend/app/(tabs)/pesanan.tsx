import React, { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/src/components/screen";
import { Button, Card, Chip, Divider, Field, Input, Picker, SectionTitle } from "@/src/components/ui";
import { useToast } from "@/src/components/toast";
import { useStore } from "@/src/store";
import type { Pesanan, PesananItem, StatusPesanan, Tipe } from "@/src/store/types";
import { colors, radius, spacing } from "@/src/theme";
import { formatRp, formatTgl, todayISO, uid } from "@/src/utils/format";
import { hitungRekap, hppJenis, jenisList, sisaStok, tagItems } from "@/src/utils/calc";
import { KURIR_NAMES, layananFor } from "@/src/utils/kurir";
import { displayWA, normalizeWA } from "@/src/utils/phone";

const PAKET_KEY = "__PAKET__";

type Form = {
  nama: string;
  wa: string;
  alamat: string;
  kota: string;
  kec: string;
  kodepos: string;
  tgl: string;
  paket: boolean;
  items: PesananItem[];
  ongkir: string;
  karantina: string;
  ops: string;
  transfer: string;
  codOngkir: boolean;
  kurir: string;
  layanan: string;
  berat: string;
};

const emptyForm = (): Form => ({
  nama: "",
  wa: "",
  alamat: "",
  kota: "",
  kec: "",
  kodepos: "",
  tgl: todayISO(),
  paket: false,
  items: [],
  ongkir: "",
  karantina: "",
  ops: "",
  transfer: "",
  codOngkir: false,
  kurir: KURIR_NAMES[0],
  layanan: layananFor(KURIR_NAMES[0])[0],
  berat: "",
});

export default function PesananScreen() {
  const { state, setState } = useStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Form>(emptyForm());
  const [showPenerima, setShowPenerima] = useState(false);
  const [openDetail, setOpenDetail] = useState<Record<string, boolean>>({});

  const allJenis = useMemo(() => jenisList(state), [state]);

  const totalHppForm = form.items.reduce((a, it) => a + it.hpp * it.jml, 0);
  const transferN = Number(form.transfer) || 0;
  const ongkirN = Number(form.ongkir) || 0;
  const karN = Number(form.karantina) || 0;
  const opsN = Number(form.ops) || 0;
  const og = form.codOngkir ? 0 : ongkirN;
  const omset = transferN - karN - og;
  const keuntunganForm = omset - totalHppForm - opsN;

  const overStok = form.items.some((it) => it.jml > sisaStok(state, it.jenis));

  function patchForm(p: Partial<Form>) {
    setForm((f) => ({ ...f, ...p }));
  }

  function addJenisToKeranjang(jenis: string) {
    if (form.items.find((i) => i.jenis === jenis)) return;
    const hpp = hppJenis(state, jenis);
    patchForm({ items: [...form.items, { jenis, jml: 1, hpp, harga: 0 }] });
  }

  function removeItem(jenis: string) {
    patchForm({ items: form.items.filter((i) => i.jenis !== jenis) });
  }

  function updateItemJml(jenis: string, jml: number) {
    patchForm({ items: form.items.map((i) => (i.jenis === jenis ? { ...i, jml } : i)) });
  }

  function togglePaketJenis(jenis: string) {
    const has = form.items.find((i) => i.jenis === jenis);
    if (has) removeItem(jenis);
    else addJenisToKeranjang(jenis);
  }

  function pickAllJenis() {
    const avail = allJenis.filter((j) => sisaStok(state, j) > 0);
    const items = avail.map((j) => {
      const existing = form.items.find((i) => i.jenis === j);
      return existing ?? { jenis: j, jml: 1, hpp: hppJenis(state, j), harga: 0 };
    });
    patchForm({ items });
  }

  function usePenerima(p: Pesanan) {
    patchForm({
      nama: p.nama,
      wa: p.wa,
      alamat: p.alamat,
      kota: p.kota,
      kec: p.kec,
      kodepos: p.kodepos,
    });
    setShowPenerima(false);
  }

  function simpan() {
    const nama = form.nama.trim();
    const alamat = form.alamat.trim();
    const kota = form.kota.trim();
    const kec = form.kec.trim();
    const wa = normalizeWA(form.wa);
    const okItems = form.items.filter((it) => it.jml > 0);
    if (!nama || !wa || !alamat || !kota || !kec || okItems.length === 0 || transferN <= 0) {
      toast.show("Lengkapi data bertanda * dan pesanan dulu");
      return;
    }
    const p: Pesanan = {
      id: uid(),
      tgl: form.tgl,
      nama,
      wa,
      alamat,
      kota,
      kec,
      kodepos: form.kodepos.trim(),
      items: okItems,
      paket: form.paket && okItems.length > 1,
      transfer: transferN,
      ongkir: ongkirN,
      karantina: karN,
      ops: opsN,
      codOngkir: form.codOngkir,
      tipe: "PICKUP",
      kurir: form.kurir,
      layanan: layananFor(form.kurir)[0] || form.layanan,
      berat: Number(form.berat) || 0,
      status: "Dikirim",
    };
    setState((s) => ({ ...s, pesanan: [p, ...s.pesanan] }));
    toast.show(`${tagItems(okItems)} tercatat di barang keluar`);
    setForm(emptyForm());
    setShowForm(false);
  }

  function toggleStatus(id: string) {
    setState((s) => ({
      ...s,
      pesanan: s.pesanan.map((p) =>
        p.id === id ? { ...p, status: (p.status === "Dikirim" ? "Problem" : "Dikirim") as StatusPesanan } : p
      ),
    }));
  }

  function hapus(id: string) {
    setState((s) => ({ ...s, pesanan: s.pesanan.filter((p) => p.id !== id) }));
    toast.show("Pesanan dihapus");
  }

  function chatWA(wa: string) {
    const n = normalizeWA(wa);
    if (n) Linking.openURL(`https://wa.me/${n}`);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return state.pesanan;
    return state.pesanan.filter((p) => {
      const haystack = [
        p.nama,
        p.kota,
        p.kec,
        p.kurir,
        p.status,
        formatTgl(p.tgl),
        p.items.map((i) => i.jenis).join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [state.pesanan, search]);

  return (
    <Screen title="Pesanan" subtitle="Catat & kelola pesanan customer">
      <Button
        title={showForm ? "Tutup form" : "+ Pesanan baru"}
        icon={showForm ? "close-outline" : "add-outline"}
        onPress={() => setShowForm((v) => !v)}
        testID="pesanan-toggle-form"
      />

      {showForm && (
        <Card testID="pesanan-form">
          {/* 1. Penerima */}
          <SectionTitle n={1} title="Info penerima" />
          <Button
            title={showPenerima ? "Tutup pilihan" : "Pilih penerima"}
            kind="alt"
            icon="person-outline"
            onPress={() => setShowPenerima((v) => !v)}
            testID="pilih-penerima-btn"
          />
          {showPenerima && (
            <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              {state.pesanan.length === 0 ? (
                <Text style={styles.muted}>Belum ada penerima tersimpan</Text>
              ) : (
                state.pesanan.slice(0, 10).map((p) => (
                  <Pressable key={p.id} style={styles.penerimaRow} onPress={() => usePenerima(p)}>
                    <Text style={styles.penerimaName}>{p.nama}</Text>
                    <Text style={styles.muted} numberOfLines={1}>
                      {p.kota} · {p.kec}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
          <View style={{ height: spacing.md }} />
          <Field label="Nama" required>
            <Input value={form.nama} onChangeText={(v) => patchForm({ nama: v })} testID="input-nama" />
          </Field>
          <Field label="No telepon" required>
            <Input
              prefix="+62"
              value={form.wa.replace(/^62/, "")}
              onChangeText={(v) => patchForm({ wa: v })}
              keyboardType="phone-pad"
              testID="input-wa"
            />
          </Field>
          <Field label="Alamat lengkap" required>
            <Input value={form.alamat} onChangeText={(v) => patchForm({ alamat: v })} multiline testID="input-alamat" />
          </Field>
          <Field label="Kota/Kabupaten" required>
            <Input value={form.kota} onChangeText={(v) => patchForm({ kota: v })} testID="input-kota" />
          </Field>
          <Field label="Kecamatan" required>
            <Input value={form.kec} onChangeText={(v) => patchForm({ kec: v })} testID="input-kec" />
          </Field>
          <Field label="Kode pos">
            <Input value={form.kodepos} onChangeText={(v) => patchForm({ kodepos: v })} keyboardType="number-pad" />
          </Field>

          <Divider />
          {/* 2. Pesanan */}
          <SectionTitle n={2} title="Pesanan" />
          <Field label="Tanggal pembuatan">
            <Input value={formatTgl(form.tgl)} editable={false} />
          </Field>
          <Field label="Pilih jenis atau paket">
            <Picker
              value=""
              placeholder="Pilih jenis atau paket"
              options={[PAKET_KEY, ...allJenis.filter((j) => sisaStok(state, j) > 0)] as string[]}
              labelFor={(v) =>
                v === PAKET_KEY
                  ? "Paket (pilih beberapa jenis)"
                  : `${v} · sisa ${sisaStok(state, v)}`
              }
              onChange={(v) => {
                if (v === PAKET_KEY) patchForm({ paket: !form.paket });
                else {
                  addJenisToKeranjang(v);
                  patchForm({ paket: false });
                }
              }}
              testID="picker-jenis"
            />
          </Field>

          {form.paket && (
            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={styles.labelInline}>Mode Paket</Text>
                <Pressable onPress={pickAllJenis}>
                  <Text style={styles.linkPrimary}>Pilih semua jenis</Text>
                </Pressable>
              </View>
              {allJenis.map((j) => {
                const sisa = sisaStok(state, j);
                const checked = !!form.items.find((i) => i.jenis === j);
                const disabled = sisa <= 0 && !checked;
                return (
                  <Pressable
                    key={j}
                    style={[styles.checkRow, disabled && { opacity: 0.4 }]}
                    disabled={disabled}
                    onPress={() => togglePaketJenis(j)}
                  >
                    <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color={colors.brandPrimary} />
                    <Text style={styles.checkLabel}>
                      {j} · sisa {sisa}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {form.items.length > 0 && (
            <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
              {form.items.map((it) => {
                const sisa = sisaStok(state, it.jenis);
                const over = it.jml > sisa;
                return (
                  <View key={it.jenis} style={[styles.itemRow, over && { borderColor: colors.accent }]}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={styles.itemJenis}>{it.jenis}</Text>
                      <Pressable onPress={() => removeItem(it.jenis)}>
                        <Ionicons name="trash-outline" size={18} color={colors.accent} />
                      </Pressable>
                    </View>
                    <Text style={styles.muted}>
                      HPP {formatRp(it.hpp)} · sisa {sisa}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 6 }}>
                      <Text style={styles.labelInline}>Jumlah</Text>
                      <View style={{ flex: 1 }}>
                        <Input
                          value={String(it.jml)}
                          keyboardType="number-pad"
                          onChangeText={(v) => updateItemJml(it.jenis, Math.max(0, parseInt(v || "0") || 0))}
                          testID={`item-jml-${it.jenis}`}
                        />
                      </View>
                    </View>
                    <Text style={{ marginTop: 6, color: colors.onSurface }}>
                      Subtotal HPP: {formatRp(it.hpp * it.jml)}
                    </Text>
                    {over && <Text style={styles.warn}>Melebihi sisa stok</Text>}
                  </View>
                );
              })}
            </View>
          )}

          <Divider />
          {/* 3. Biaya & transfer */}
          <SectionTitle n={3} title="Biaya & transfer" />
          <View style={styles.rowRead}>
            <Text style={styles.muted}>HPP global</Text>
            <Text style={styles.readVal}>{formatRp(totalHppForm)}</Text>
          </View>
          <View style={styles.rowRead}>
            <Text style={styles.muted}>Keuntungan (perkiraan)</Text>
            <Text style={[styles.readVal, keuntunganForm < 0 && { color: colors.accent }]}>{formatRp(keuntunganForm)}</Text>
          </View>
          <Field label="Ongkir (dibayar pembeli)">
            <Input value={form.ongkir} onChangeText={(v) => patchForm({ ongkir: v })} keyboardType="number-pad" />
          </Field>
          <Field label="Biaya karantina (dibayar pembeli)">
            <Input value={form.karantina} onChangeText={(v) => patchForm({ karantina: v })} keyboardType="number-pad" />
          </Field>
          <Field label="Biaya operasional">
            <Input value={form.ops} onChangeText={(v) => patchForm({ ops: v })} keyboardType="number-pad" />
          </Field>
          <Field label="Total Customer Transfer" required>
            <Input value={form.transfer} onChangeText={(v) => patchForm({ transfer: v })} keyboardType="number-pad" testID="input-transfer" />
          </Field>

          <Divider />
          {/* 4. Pengiriman */}
          <SectionTitle n={4} title="Pengiriman" />
          <Field label="Ekspedisi">
            <Picker
              value={form.kurir}
              options={KURIR_NAMES}
              onChange={(v) =>
                patchForm({ kurir: v, layanan: layananFor(v)[0] || "Reguler" })
              }
              testID="picker-kurir"
            />
          </Field>
          <Field label="Layanan">
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Chip
                label="Non COD"
                active={!form.codOngkir}
                onPress={() => patchForm({ codOngkir: false })}
                testID="layanan-noncod"
              />
              <Chip
                label="COD Ongkir"
                active={form.codOngkir}
                color="pink"
                onPress={() => patchForm({ codOngkir: true })}
                testID="layanan-cod"
              />
            </View>
          </Field>
          <Field label="Berat paket (kg)">
            <Input value={form.berat} onChangeText={(v) => patchForm({ berat: v })} keyboardType="decimal-pad" />
          </Field>

          <Divider />
          <SectionTitle title="Rekapan" />
          <Rekapan
            transfer={transferN}
            ongkir={ongkirN}
            karantina={karN}
            ops={opsN}
            hpp={totalHppForm}
            codOngkir={form.codOngkir}
          />
          {overStok && <Text style={styles.warn}>Beberapa item melebihi sisa stok</Text>}

          <View style={{ height: spacing.md }} />
          <Button title="Simpan pesanan" icon="save-outline" onPress={simpan} testID="simpan-pesanan" />
        </Card>
      )}

      <Input placeholder="Cari (nama, jenis, kota, ekspedisi, tanggal, status)" value={search} onChangeText={setSearch} testID="search-pesanan" />

      {filtered.length === 0 && (
        <Card>
          <Text style={styles.muted}>Belum ada pesanan</Text>
        </Card>
      )}

      {filtered.map((p) => {
        const rek = hitungRekap(p);
        const open = !!openDetail[p.id];
        return (
          <Card key={p.id} testID={`pesanan-card-${p.id}`}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.nama}</Text>
                <Text style={styles.muted}>Dibuat {formatTgl(p.tgl)}</Text>
              </View>
              <Pressable onPress={() => toggleStatus(p.id)}>
                <Chip
                  label={p.status}
                  color={p.status === "Dikirim" ? "green" : "pink"}
                  testID={`status-chip-${p.id}`}
                />
              </Pressable>
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {p.items.map((it) => (
                <Chip key={it.jenis} label={`${it.jenis} x${it.jml}`} color="muted" />
              ))}
              {p.paket && <Chip label="Paket" color="pink" />}
            </View>
            <Text style={[styles.muted, { marginTop: 8 }]}>
              {p.kurir} {p.layanan ? `· ${p.layanan}` : ""} · {p.berat || 0} kg
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.md, marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.muted}>Total transfer</Text>
                <Text style={styles.money}>{formatRp(rek.totalTransfer)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.muted}>Keuntungan</Text>
                <Text style={[styles.money, rek.keuntungan < 0 && { color: colors.accent }]}>{formatRp(rek.keuntungan)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={open ? "Tutup detail" : "Lihat detail"}
                  kind="alt"
                  onPress={() => setOpenDetail((d) => ({ ...d, [p.id]: !open }))}
                  testID={`lihat-detail-${p.id}`}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button title="Chat WhatsApp" kind="out" icon="logo-whatsapp" onPress={() => chatWA(p.wa)} />
              </View>
            </View>
            {open && (
              <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
                <DetailBlock title="Penerima">
                  <DetailRow k="Nama" v={p.nama} />
                  <DetailRow k="WA" v={displayWA(p.wa)} />
                  <DetailRow k="Alamat" v={p.alamat} />
                  <DetailRow k="Kota" v={p.kota} />
                  <DetailRow k="Kec" v={p.kec} />
                  {p.kodepos ? <DetailRow k="Kode pos" v={p.kodepos} /> : null}
                </DetailBlock>
                <DetailBlock title="Pesanan">
                  {p.items.map((it) => (
                    <DetailRow key={it.jenis} k={it.jenis} v={`${it.jml} pohon · HPP ${formatRp(it.hpp)}`} />
                  ))}
                </DetailBlock>
                <DetailBlock title="Pengiriman">
                  <DetailRow k="Kurir" v={`${p.kurir} ${p.layanan}`} />
                  <DetailRow k="Tipe" v={p.tipe} />
                  <DetailRow k="Berat" v={`${p.berat} kg`} />
                </DetailBlock>
                <DetailBlock title="Rekapan">
                  <Rekapan
                    transfer={p.transfer}
                    ongkir={p.ongkir}
                    karantina={p.karantina}
                    ops={p.ops}
                    hpp={rek.totalHpp}
                    codOngkir={p.codOngkir}
                  />
                </DetailBlock>
                <Pressable onPress={() => hapus(p.id)} style={{ alignSelf: "flex-start", marginTop: 4 }}>
                  <Text style={styles.linkDanger}>Hapus pesanan</Text>
                </Pressable>
              </View>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

function Rekapan({
  transfer,
  ongkir,
  karantina,
  ops,
  hpp,
  codOngkir,
}: {
  transfer: number;
  ongkir: number;
  karantina: number;
  ops: number;
  hpp: number;
  codOngkir: boolean;
}) {
  const og = codOngkir ? 0 : ongkir;
  const hargaJual = transfer - karantina - og;
  const keuntungan = hargaJual - hpp - ops;
  const kiri = transfer - og - karantina - ops;
  const kanan = hpp + keuntungan;
  const sesuai = Math.round(kiri) === Math.round(kanan);
  return (
    <View>
      <RRow label="Total Customer Transfer" val={transfer} />
      <RRow label="− Ongkir" val={-og} />
      <RRow label="− Biaya karantina" val={-karantina} />
      <RRow label="= Harga jual" val={hargaJual} bold />
      <RRow label="− Total HPP" val={-hpp} />
      <RRow label="− Biaya operasional" val={-ops} />
      <RRow label="= Keuntungan" val={keuntungan} bold danger={keuntungan < 0} />
      <View style={{ marginTop: 6, flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={styles.muted}>Cek: Transfer − ongkir − karantina − operasional = HPP + Keuntungan</Text>
      </View>
      <Text style={{ color: sesuai ? colors.brandPrimary : colors.accent, fontWeight: "700" }}>
        {sesuai ? "Sesuai" : "Tidak sesuai"}
      </Text>
      {codOngkir && (
        <Text style={[styles.muted, { marginTop: 4 }]}>
          Catatan: Ongkir dibayar ke kurir dan tidak ikut ditransfer.
        </Text>
      )}
    </View>
  );
}

function RRow({ label, val, bold, danger }: { label: string; val: number; bold?: boolean; danger?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: colors.onSurface, fontWeight: bold ? "700" : "400" }}>{label}</Text>
      <Text
        style={{
          color: danger ? colors.accent : colors.onSurface,
          fontWeight: bold ? "700" : "400",
        }}
      >
        {formatRp(val)}
      </Text>
    </View>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.detailTitle}>{title}</Text>
      <View style={{ marginTop: 4 }}>{children}</View>
    </View>
  );
}

function DetailRow({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
      <Text style={styles.muted}>{k}</Text>
      <Text style={{ color: colors.onSurface, flex: 1, textAlign: "right", marginLeft: 8 }} numberOfLines={2}>
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  money: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  itemRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceTertiary,
  },
  itemJenis: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  rowRead: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  readVal: { color: colors.onSurface, fontWeight: "700" },
  labelInline: { fontSize: 13, fontWeight: "600", color: colors.onSurface },
  linkPrimary: { color: colors.brandPrimary, fontWeight: "700" },
  linkDanger: { color: colors.accent, fontWeight: "700" },
  warn: { color: colors.accent, fontWeight: "600", marginTop: 6 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  checkLabel: { color: colors.onSurface, fontSize: 14 },
  penerimaRow: {
    padding: spacing.md,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  penerimaName: { color: colors.onSurface, fontWeight: "700" },
  detailBlock: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailTitle: { fontWeight: "700", color: colors.onSurface, marginBottom: 2 },
});

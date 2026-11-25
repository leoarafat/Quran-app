/** Folder names on everyayah.com. Sample files of each were checked on 2026-11-25. */
export const RECITERS = [
  { id: "Alafasy_128kbps", name: "মিশারি রাশিদ আল-আফাসি" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "আব্দুল বাসিত (মুরাত্তাল)" },
  { id: "Abdurrahmaan_As-Sudais_192kbps", name: "আব্দুর রহমান আস-সুদাইস" },
  { id: "Saood_ash-Shuraym_128kbps", name: "সাউদ আশ-শুরাইম" },
  { id: "MaherAlMuaiqly128kbps", name: "মাহের আল-মুআইকলি" },
  { id: "Ghamadi_40kbps", name: "সাদ আল-গামিদি" },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps", name: "আবু বকর আশ-শাতরি" },
  { id: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net", name: "আহমাদ আল-আজমি" },
  { id: "Hudhaify_128kbps", name: "আলী আল-হুযাইফি" },
  { id: "Minshawy_Murattal_128kbps", name: "মুহাম্মাদ সিদ্দিক আল-মিনশাবি" },
  { id: "Husary_128kbps", name: "মাহমুদ খলিল আল-হুসারি" },
  { id: "Muhammad_Ayyoub_128kbps", name: "মুহাম্মাদ আইয়ুব" },
  { id: "mahmoud_ali_al_banna_32kbps", name: "মাহমুদ আলী আল-বান্না" },
  { id: "Salaah_AbdulRahman_Bukhatir_128kbps", name: "সালাহ বুখাতির" },
  { id: "Abdullah_Basfar_192kbps", name: "আব্দুল্লাহ বাসফার" },
] as const;

export const AUDIO_BASE = "https://everyayah.com/data";

export function ayahAudioUrl(reciter: string, surah: number, ayah: number): string {
  const pad = (n: number) => String(n).padStart(3, "0");
  return `${AUDIO_BASE}/${reciter}/${pad(surah)}${pad(ayah)}.mp3`;
}

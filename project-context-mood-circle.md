# Project Context: Mood Check-in + Circle Sharing App

## Status saat ini
Tim (Raqill + temen temen, semua bisa coding) udah setuju lanjut ide ini setelah proses brainstorm panjang. Next step: Wizard-of-Oz test manual (simulasi via WA grup, 1 minggu) sebelum mulai desain/build, buat validasi apa circle beneran mau check-in mood harian dan apa fitur share-nya kerasa berguna atau malah awkward.

## Ide intinya
App buat check-in mood harian (tap warna/emoji, cepat, ga perlu nulis panjang), yang bisa di-share ke circle teman dekat (bukan publik), plus mini-game ringan yang disesuaikan sama mood yang dicatat buat bantu regulasi emosi.

## Kenapa ide ini yang dipilih (dari banyak ide yang udah dieksplor)
- **No cold start**: circle sendiri jadi user pertama, ga butuh nunggu stranger
- **Deket ke semua orang di tim**, bukan cuma minat personal satu orang (beda dari ide kopi yang cuma relevan ke yang suka ngopi)
- Diferensiasinya jelas dan belum ada yang ngerjain (fitur share-ke-circle), bukan nyaingin fitur yang udah dimenangin app lain

## Temuan riset penting yang harus diingat
- **Mood tracker pake warna/tap itu udah sangat saturated** (Daylio, RILIV, DailyBean, Pixels, dll). Fitur ini posisinya table stakes/baseline, BUKAN selling point. Jangan habiskan energi desain di sini.
- **Fitur share mood ke circle kecil buat saling comfort, ga ketemu di app manapun** sebagai fitur utama saat dicek. Ini diferensiator utama, energi desain harus fokus ke sini.
- **Mini-game buat mood marah JANGAN bertema venting/pelampiasan** (mukul mukul virtual, dst). Riset psikologi (sejak 1959, dikonfirmasi lagi oleh Bushman et al 1999 dan studi 2021) konsisten nunjukin venting lewat agresi fisik justru **menaikkan** agresi dan amarah, terutama kalau dibarengin rumination (mikirin lagi penyebab marahnya). Yang efektif itu **distraction**, ngalihin fokus ke hal yang beda total dari sumber marah.
- **Design risk yang perlu diantisipasi**: fitur share mood otomatis bikin implicit social contract. Kalau ada yang share mood buruk dan ga ada yang notice/respon, itu bisa kerasa lebih nyesek daripada kalau ga ada fitur share-nya sama sekali. Perlu di-frame jelas ke semua user dari awal sebagai "circle buat saling check-in santai", BUKAN pengganti crisis support atau garansi ada yang nolong.

## Ide ide lain yang udah dieksplor dan kenapa di-drop
(biar ga muter balik ke ide yang udah pernah ditolak)
- Financial tracker + split bill: saturated, fitur split bill udah jadi fitur gratis bawaan Dana/GoPay/Jenius/blu
- Pokemon Go buat kucing jalanan: udah ada (CatchCat), baru viral, window-nya udah dipegang pemain lain
- Lomba team-matching: info-lomba aggregator udah saturated (infolomba.id dkk), dan team-matching buat lomba ada constraint trust/satu kampus yang signifikan
- Magang ghosting tracker: pain-nya valid dan terdokumentasi kuat, tapi kena cold start problem (butuh banyak data report dulu biar berguna), sebagian fitur udah partial ke-cover KitaLulus/Glints
- Kantin queue tracker: versi crowdsource kurang presisi buat kebutuhan Raqill, versi presisi butuh kerja sama vendor satu satu yang terlalu berat buat side project santai
- Lain lain yang sempet dibahas tapi cepat di-drop: blind box trading (sinyal lemah), kos expense tracker (ga relevan, ga ada yang kos bareng), circle accountability board (terlalu mirip cuma bikin template Notion), barang titip/pinjem antar circle (concern keamanan barang belum ada solusinya)

## Gaya kerja tim
Santai, ga ada deadline ketat ("liat aja jalannya"), semua anggota bisa coding, pakai Claude Code buat build.

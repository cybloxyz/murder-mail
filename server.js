import 'dotenv/config';
import express from 'express';
import { Resend } from 'resend';
import cors from 'cors';

const app = express();
const PORT = 3000;

const resend = new Resend(process.env.RESEND_API_KEY);

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());

app.post('/api/subscribe', async (req, res) => {
    const { name, email } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Nama dan alamat email wajib diisi!" });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        const cleanIp = clientIp.includes('::1') ? '' : clientIp;
        
        let locationInfo = "Lokal / Development";
        if (cleanIp) {
            const geoRes = await fetch(`http://ip-api.com/json/${cleanIp}`);
            const geoData = await geoRes.json();
            if (geoData.status === 'success') {
                locationInfo = `${geoData.city}, ${geoData.country}`;
            }
        }

        console.log(`[PELACAKAN IP] Detektif ${name} mendaftar dari IP: ${clientIp} (${locationInfo})`);
    } catch (geoError) {
        console.log(`[PELACAKAN IP] Gagal melacak lokasi IP: ${clientIp}`);
    }

    try {
        const data = await resend.emails.send({
            from: 'murder@nfnaa.dev',
            to: [email],
            subject: '[CAUTION] ',
            html: `
                <div style="font-family: monospace; background-color: #f4eee1; color: #2c241d; padding: 20px; border: 2px solid #990000;">
                    <h2 style="color: #990000; text-transform: uppercase;">[CLASSIFIED DOSSIER]</h2>
                    <p>Halo <b>${name}</b>,</p>
                    <p>Aku Tacoz.</p>
                    <p>Jangan lupakan namaku.</p>
                    <hr style="border: 1px dashed #d0c2b0; margin: 20px 0;">
                    <p style="font-size: 11px; color: #6b5b52;">PROJECT: REDACTED // Murder Mailer</p>
                </div>
            `
        });

        console.log(`[BERHASIL] Berkas terkirim ke: ${email} (Nama: ${name})`, data);
        res.status(200).json({ success: true, message: "Berkas berhasil dikirim!" });
    } catch (error) {
        console.error("Gagal mengirim email:", error);
        res.status(500).json({ success: false, message: "Gagal terhubung ke server email." });
    }
});

app.listen(PORT, () => {
    console.log(`Server game berjalan di http://localhost:${PORT}`);
});
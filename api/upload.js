export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const chunks = [];

        for await (const chunk of req) {
            chunks.push(chunk);
        }

        const body = Buffer.concat(chunks);

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": req.headers["content-type"]
                },
                body
            }
        );

        const result = await response.json();

        return res.status(response.status).json(result);
    } catch (error) {
        return res.status(500).json({
            error: "Upload failed",
            details: error.message
        });
    }
}

export const config = {
    api: {
        bodyParser: false
    }
};
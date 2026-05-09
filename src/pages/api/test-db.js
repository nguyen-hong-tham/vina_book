import db from "@/lib/db";

export default async function handler(req, res) {
  try {
    const [rows] = await db.query(
      "SELECT * FROM books"
    );

    res.status(200).json(rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Database failed",
      error: error.message,
    });
  }
}
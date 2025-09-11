export default async function handler(req, res) {
  const { latitude, longitude } = req.query;

  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&temperature_unit=celsius`
    );

    const data = await response.json();
    res.status(200).json(data);
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch weather" });
  }
}

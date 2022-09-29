exports.getTrips = (req, res, next) => {
  res.status(200).json({ message: "Fetch all trips" });
};

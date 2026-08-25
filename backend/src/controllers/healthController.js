const health = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API ProvGestion operativa'
  });
};

module.exports = {
  health
};
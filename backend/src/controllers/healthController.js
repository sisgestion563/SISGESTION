const health = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API SISGESTION operativa'
  });
};

module.exports = {
  health
};
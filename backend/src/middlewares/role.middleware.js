const authorizeRole = (roles) => {

    return (req,res,next) => {

        if (
            !roles.includes(req.user.rol)
        ) {

            return res.status(403).json({
                success:false,
                message:'Acceso denegado'
            });

        }

        next();

    };

};

module.exports = {
    authorizeRole
};
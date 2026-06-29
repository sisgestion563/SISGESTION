const authService =
require('../services/auth.service');

const login = async (req,res) => {

    try {

        const {
            username,
            password
        } = req.body;

        const result =
            await authService.login(
                username,
                password
            );

        return res.status(200).json({
            success: true,
            message:
                'Login correcto',
            data: result
        });

    }
    catch(error) {

        return res.status(401).json({
            success: false,
            message:
                error.message
        });

    }

};

const me = async (req,res) => {

    return res.status(200).json({
        success: true,
        data: req.user
    });

};

module.exports = {
    login,
	me
};
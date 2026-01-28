import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    //Tokent általában az 'authorization' fejlécben küldjük ami így néz ki: Bearer <token>
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] //Nekünk csak a token kell a bearer után

    if (!token) {
        return res.status(401).json({ message: "Hozzáférés megtagadva! Nincs token." })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey')

        req.user = decoded

        next()
    }
    catch (error) {
        return res.status(403).json({ message: "Érvénytelen vagy lejárt token!" })
    }
}

//Speciális middleware csak szolgáltatóknak
export const isProvider = (req, res, next) => {
    if (req.user.providerId == null) {
        return res.status(403).json({ message: "Ehhez a művelethez szolgáltatói fiók szükséges!" })
    }

    next()
}
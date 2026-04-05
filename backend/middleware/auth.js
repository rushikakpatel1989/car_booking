
const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
 try {
 /* const header = req.headers.authorization;
  if(!header) return res.status(401).json({msg:'No token'});
  const token = header.split(' ')[1];
  req.user = jwt.verify(token, process.env.JWT_SECRET);
  next();*/
const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        // Split Bearer token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
} catch (err) {
        console.error(err);
        return res.status(401).json({ message: "Unauthorized" });
    }
};

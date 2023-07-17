const { json } = require('body-parser')
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt')

exports.postUsers = async (req,res,next) => {

    const { name, email, password } = req.body
    // const name = req.body.name
    // const email = req.body.email
    // const password = req.body.password

    const users = await User.find()  // array
    //console.log(users[0])
    for(let i=0; i<users.length; i++){
        if(users[i].email === email)
        {
            console.log(email)
            let responseObject = { message: 'Email Already Taken' }
            return res.send(responseObject)
        }
    }
    
    bcrypt.hash(password,10, async (err, hash)=> {
        const data = new User({
            name: name,
            email: email,
            password: hash
        })
        await data.save()
        return res.json({data: data, message: 'User Created'})

    })   
    
    
}

function generateAccessToken(id) {
    return jwt.sign({userId : id}, 'dvElG2diDtMN4DQoyEMcCQ7HaAGEuEM4')
}

exports.postLogin = async (req,res,next) => {
    

    const {email, password} = req.body
         
    console.log("email " + email)
    console.log("password " + password)


    const loginUser = await User.find({'email': email}) //use [0] with findAll()
    //console.log(loginUser)
   
    //console.log('length[0]', loginUser[0])
    if(loginUser[0]){

        bcrypt.compare(password, loginUser[0].password, async (err, result) => {
            //console.log(password, "    ", "login wala pass", loginUser[0].password)
            if(err) {
                throw new Error('some error ocured')
            }
            if(result === true){
                res.status(200).json({ message: 'credentials matched', success: true, token: generateAccessToken(loginUser[0]._id) })
            }
            else {
                res.json({ message: 'not matched', success: false})
            }

         })   
    }
    else{
        return res.json({message: 'user do not exist', success: false})
    } 

}



exports.getUser404 = (req,res,next) => {
    let responseObject = { message: 'user not found'}
    res.json(responseObject)
}
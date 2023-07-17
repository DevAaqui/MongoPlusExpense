const Expense = require('../model/expense')
const User = require('../model/userModel')
const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk')
const DownloadFiles = require('../model/downloadfile')



//Pagination
exports.getPagination = async (req,res)=> {
    const ITEMS_PER_PAGE = 5
    const page =  +req.query.page || 1 //req.query.page 
    const limit = +req.query.limit || 1
    console.log('>>>>>>>>>>>>>>>>>>>', page, limit )
    let totalItems

    // DownloadFiles.countDocuments()
    // .then((total)=> {
    //     console.log(total)
    //     totalItems=total
    //     return DownloadFiles.find({
    //         offset: (page - 1)*limit,
    //         limit: limit
    //     })
    // })

    DownloadFiles.countDocuments()
    .then((total)=> {
        console.log(total)
        totalItems=total
        return DownloadFiles.find().skip((page - 1)*limit).limit(limit)
    
    })
    .then((files)=> {
        res.json({
            files:files,
            currentPage: page,
            hasNextPage: limit * page <totalItems,
            nextPage: page+1,
            hasPreviousPage: page > 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalItems/limit)
        })
    })
    .catch(err=>console.log(err))
}

exports.downloadexpense = async (req,res)=> {
 try{
   const expenses = await Expense.find()
   console.log('Expense Array>>>>>>>>>>>>>>>>>>>',expenses)

   const stringifiedExpenses = JSON.stringify(expenses)

   const userId = req.user._id
   const filename = `Expenses${userId}/${new Date}.txt`
   const fileURL = await uploadToS3(stringifiedExpenses, filename)

   console.log('FileURL>>>>>', fileURL)
   //const createdLink = await DownloadFiles.create({dlink: fileURL, userId: userId})
   const createdLink = new DownloadFiles({
        dlink: fileURL,
        userId: userId
   })
   await createdLink.save()

   const allLinks = await DownloadFiles.find()

   return res.status(201).json({fileURL, allLinks: allLinks, success: true})
 }
 catch(err){
    console.log(err)
    res.status(500).json({fileURL: '', success: false})
 }
    

   

}

async function uploadToS3(data, filename)
{
    try{
        const BUCKET_NAME = 'expensetrackerappproject'
        const IAM_USER_KEY = 'AKIAYEM5YODITOSFGOUW'
        const IAM_USER_SECRET = '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'

        let s3Bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
            //Bucket: BUCKET_NAME
        })

        
        var params = {
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: data,
                ACL: 'public-read'
        }
        return new Promise((resolve,reject)=> {
            s3Bucket.upload(params, (err, s3response)=> {
                if(err){
                    reject(err)
                }
                else{
                    console.log('Success', s3response)
                    resolve(s3response.Location) 
                }
            })
        })
            
    }
    catch(err){
        throw new Error(err)
    }
    

}



exports.postAddExpense = async (req,res,next) => {
    try{
        const money = req.body.moneySpent
        const descrip = req.body.description
        const categ = req.body.category
        const userId = req.user._id
        console.log('req.user in controller  ', req.user)
        //console.log(req.body)

        console.log(money, descrip, categ, userId)
        let total = Number(req.user.totalExpense) +Number(money)
        console.log('totalExpense>>>>>>>>>>>>>>',total)
        //req.user.totalExpense = total
        const user = await User.findOne({'_id': req.user._id})
        user.totalExpense = total
        await user.save()
    
        const data = new Expense({
            spent: money,
            description: descrip,
            category: categ,
            userId : userId
            
        })
        await data.save()


        return res.json({data: data , message: 'Expense Created'})        

    }
    catch(err){
        res.status(500).json(err)
    }
    
}

exports.getAllExpenses = async (req,res,next) => {
    try{
        console.log('Request>>>>>>>>', req.user)
    const allExpense = await Expense.find({'userId': req.user._id})
    //console.log(allExpense)
    res.json({allExpense:allExpense, success: true})
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    }
    
}

exports.deleteExpense = async (req,res,next) => {
    try{
        const deleteId = req.params.id
        const userId = req.user._id
        let total

        console.log('Delete wala userId>>>>', userId)
    const userObj = await User.findOne({'_id': userId})
    const expenseObj = await Expense.findOne({'_id': deleteId})
    console.log(expenseObj)
    console.log('req.user',req.user.totalExpense)
    total = Number(req.user.totalExpense) - Number(expenseObj.spent)
    console.log(total)
    userObj.totalExpense = total

    await userObj.save()

    const deleteExpense = await Expense.deleteOne({'_id': deleteId})

     return res.json({message: 'DELETED', success: true})
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    }
    

}








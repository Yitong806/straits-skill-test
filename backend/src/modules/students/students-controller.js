const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");
const {addOrUpdateStudent, findAllStudents} = require("./students-repository");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    //write your code

});

const handleAddStudent = asyncHandler(async (req, res) => {
    //write your code
    const payload = req.body
    console.log(payload)
    const result = await addNewStudent(payload)
        res.status(201).json({
        status: result.status,
        data: { userId: result.userId },
        message: result.message
    });

});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    //write your code

});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    //write your code

});

const handleStudentStatus = asyncHandler(async (req, res) => {
    //write your code

});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
};

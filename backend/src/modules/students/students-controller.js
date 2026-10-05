const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");
const {addOrUpdateStudent, findAllStudents} = require("./students-repository");
const {getAllClasses, getClassDetail} = require("../classes/classes-repository");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    //write your code
    const payload = req.query
    const keys = Object.keys(payload)
    const parsed = {};
    if (keys.length > 0){
        const firstKey = keys[0]
        const firstValue = payload[firstKey]
        const targetString = `${firstKey}=${firstValue}`

        // console.log(targetString)
        targetString.split(',').forEach(pair => {
            const [key, ...valueParts] = pair.split('=');
            if (key && valueParts.length > 0) {
                parsed[key.trim()] = decodeURIComponent(valueParts.join('=')).trim();
            }
        });
    }
    // console.log(parsed)

    if ('class' in parsed){
        const id = parsed['class']
        const classesDetail = await getClassDetail(id)
        // console.log('classDetail', classesDetail)
        parsed['className'] = classesDetail['name']
    }

    const result = await findAllStudents(parsed)
    console.log('Fetched data', result)
    res.status(200).json({
        status: result.status,
        data: result,
        message: 'Students fetched successfully'
    });

});

const handleAddStudent = asyncHandler(async (req, res) => {
    //write your code
    const payload = req.body
    // console.log(payload)

    const errors = checkAddStudentPayload(payload)
    if (errors.length > 0){
        res.status(400).json({
            status: false,
            message: errors.join(', ')
        });
        return;
    }

    const result = await addNewStudent(payload)
    res.status(201).json({
        status: result.status,
        data: { userId: result.userId },
        message: result.message
    });

});

const isAllDigits = (str) => /^\d+$/.test(str);

const checkAddStudentPayload = (payload) => {
    const errors = [];

    if (!payload.name || !payload.name.trim()) {
        errors.push('Name is required');
    }
    if (!payload.phone || !isAllDigits(payload.phone)){
        errors.push('Phone number must be digits')
    }
    if (!payload.email || !payload.email.trim()) {
        errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        errors.push('Email format is invalid');
    }
    if (!payload.class || !payload.class.trim()) {
        errors.push('Class is required');
    }
    if (!payload.section || !payload.section.trim()) {
        errors.push('Section is required');
    }
    if (!payload.roll || !payload.roll.toString().trim()) {
        errors.push('Roll number is required');
    }
    if(!isAllDigits(payload.roll.toString())){
        errors.push('Roll number must be digits')
    }
    if (!payload.fatherName || !payload.fatherName.trim()) {
        errors.push('Father name is required');
    }
    if (!payload.guardianName || !payload.guardianName.trim()) {
        errors.push('Guardian name is required');
    }
    if (!payload.guardianPhone || !isAllDigits(payload.guardianPhone)){
        errors.push('Guadian phone number must be digits')
    }
    if (!payload.dob) {
        errors.push('Date of birth is required');
    }
    if (!payload.admissionDate) {
        errors.push('Admission date is required');
    }

    return errors;
};



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

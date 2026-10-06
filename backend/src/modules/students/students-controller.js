const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent } = require("./students-service");
const {fetchClassDetail} = require("../classes/classes-service");

const handleGetAllStudents = asyncHandler(async (req, res) => {
    //write your code

    /* It seems that req.query is organized in a strange form such as { class: '2,section=section1' }?
    *  so it would be better to first change it into string like 'class=2,section=section1'
    *  then change it into dict like {class: '2', section: 'section1'}
    *
    *  Suggestion: modify the data form passed from the frontend.
    *
    *  however class's value is classId, so we need to fetch class detail first and extract the name field.
    * */
    const payload = req.query
    const keys = Object.keys(payload)
    const parsed = {};
    Object.entries(payload).forEach(([key, value]) => {
        const targetString = `${key}=${value}`
        targetString.split(',').forEach(pair => {
            const [key, ...valueParts] = pair.split('=');
            if (key && valueParts.length > 0) {
                parsed[key.trim()] = decodeURIComponent(valueParts.join('=')).trim();
            }
        });
    })

    if ('class' in parsed){
        const id = parsed['class']
        const classesDetail = await fetchClassDetail(id)
        parsed['className'] = classesDetail['name']
    }

    const students = await getAllStudents(parsed)
    res.status(200).json({
        students: students
    });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    /*
    * First check whether the information is completed correctly.
    * If not, then show detailed information to users to avoid confusion.
    *
    * After parameters checking, directly use addNewStudent.
    * Notice that the status code should be 201, not 200.
    * */
    //write your code
    const payload = req.body

    const errors = checkStudentPayload(payload)
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

const checkStudentPayload = (payload) => {
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
    if (payload.roll === undefined || payload.roll === null || payload.roll.toString().trim() === '') {
        errors.push('Roll number is required');
    } else if (!isAllDigits(payload.roll.toString())) {
        errors.push('Roll number must be digits');
    }
    if (!payload.fatherName || !payload.fatherName.trim()) {
        errors.push('Father name is required');
    }
    if (payload.fatherPhone && !isAllDigits(payload.fatherPhone)) {
        errors.push('Father phone number must be digits');
    }
    if (payload.motherName && payload.motherPhone && !isAllDigits(payload.motherPhone)) {
        errors.push('Mother phone number must be digits');
    }
    if (!payload.guardianName || !payload.guardianName.trim()) {
        errors.push('Guardian name is required');
    }
    if (!payload.guardianPhone){
        errors.push('Guardian phone number is required')
    }
    if(!isAllDigits(payload.guardianPhone)){
        errors.push('Guardian phone number must be digits')
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
    /*
    * Similar logic with handleAddStudent
    * Frontend validation incorrectly rejects pure digits for roll field.
    * This is a frontend issue — backend correctly enforces numeric roll.
    * TODO: frontend roll validation should be fixed to accept digits.
    */

    const { id } = req.params;
    const payload = req.body;

    if (!id) {
        res.status(400).json({
            status: false,
            message: 'Student ID is required'
        });
        return;
    }

    const errors = checkStudentPayload(payload);
    if (errors.length > 0) {
        res.status(400).json({
            status: false,
            message: errors.join(', ')
        });
        return;
    }


    const result = await updateStudent({ ...payload, userId: Number(id) });

    res.status(200).json({
        status: result.status,
        data: { userId: result.userId },
        message: result.message
    });
});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    // write your code

    /*
    * First check the data form correctness of studentId
    * the data structure required by frontend seems like:
    * so directly return the data structure from getStudentDetail
    * */
    const {id} = req.params

    if (!id) {
        res.status(400).json({
            status: false,
            message: 'Student ID is required'
        });
        return;
    }

    if (!isAllDigits(id)){
        res.status(400).json({
            status: false,
            message: 'Student ID must be digits'
        });
        return;
    }

    const student = await getStudentDetail(Number(id));

    if (!student) {
        res.status(404).json({
            status: false,
            message: 'Student not found'
        });
        return;
    }

    res.status(200).json(student);
});

const handleStudentStatus = asyncHandler(async (req, res) => {
    /*
    * Notice the reviewerId is located in req.user*/
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        res.status(400).json({
            status: false,
            message: 'Student ID is required'
        });
        return;
    }

    if (status === undefined || status === null) {
        res.status(400).json({
            status: false,
            message: 'Status is required'
        });
        return;
    }

    const result = await setStudentStatus({
        userId: Number(id),
        reviewerId: req.user.id,
        status: status
    });

    res.status(200).json({
        status: true,
        message: result.message
    });
});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
};

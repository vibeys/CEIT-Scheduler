// Curriculum data (copied from your original HTML, unchanged)
        const COURSE_MAP = {
            "BSCpE": {
                "Curriculum 2022-2023": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] },
                "Curriculum 2026-2027": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] }
            },
            "BSECE": {
                "Curriculum 2022-2023": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] },
                "Curriculum 2026-2027": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] }
            },
            "BSIE": {
                "Curriculum 2022-2023": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] },
                "Curriculum 2026-2027": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem", "Mid Year"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] }
            },
            "BSCS": {
                "Curriculum 2023-2024": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] },
                "Curriculum 2026-2027": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] }
            },
            "BSIT": {
                "Curriculum 2023-2024": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] },
                "Curriculum 2026-2027": { 1: ["1st Sem", "2nd Sem"], 2: ["1st Sem", "2nd Sem"], 3: ["1st Sem", "2nd Sem", "Mid Year"], 4: ["1st Sem", "2nd Sem"] }
            }
        };

        // --- CURRICULUM DATABASE ---
        const CURRICULUM_DATABASE = {
            "BSCpE": {
                "Curriculum 2022-2023": {
                    1: {
                        "1st Sem": [
                            { code: "MATH 101", name: "Remedial in Mathematics" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "CpE 111", name: "Computer Engineering as a Discipline" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "General Chemistry for Engineers – Lab" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "IT 111", name: "I.T. Fundamentals" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 1", name: "Physics for Engineers – Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers – Lab" },
                            { code: "CpE 121L", name: "Comp Prog’g Logic & Design (C++)" },
                            { code: "DISMAT 1", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "National Service Training Program 2" },
                            { code: "GE 04", name: "Understanding the Self" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "ENGDAT 1", name: "Engineering Data Analysis" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "CpE 211L", name: "Object Oriented Programming (OOP w/ Database)" },
                            { code: "CIRCUITS 1", name: "Fundamentals of Electrical Circuits – Lec" },
                            { code: "CIRCUITS 1L", name: "Fundamentals of Electrical Circuits – Lab" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "CpE 221", name: "System Fundamentals" },
                            { code: "CpE 222L", name: "Data Structures & Algorithms" },
                            { code: "CpE 223", name: "Numerical Methods" },
                            { code: "ELECS 1", name: "Fundamentals of Electronic Circuits – Lec" },
                            { code: "ELECS 1L", name: "Fundamentals of Electronic Circuits – Lab" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ],
                        "Mid Year": [
                            { code: "CpE 231", name: "Logic Circuits & Design – Lec" },
                            { code: "CpE 231L", name: "Logic Circuits & Design – Lab" },
                            { code: "CpE 232", name: "Data and Digital Communications" },
                            { code: "CpE 233", name: "Fundamentals of Mixed Signals and Sensors" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "RESEARCH 1", name: "Methods of Research" },
                            { code: "CpE 311", name: "Computer Engineering Drafting & Design" },
                            { code: "CpE 312", name: "Computer Architecture and Org – Lec" },
                            { code: "CpE 312L", name: "Computer Architecture and Org – Lab" },
                            { code: "CpE 313", name: "Software Design – Lec" },
                            { code: "CpE 313L", name: "Software Design – Lab" },
                            { code: "CpE 314", name: "Operating Systems" },
                            { code: "CpE 315", name: "Introduction to HDL" },
                            { code: "CpE 316", name: "Advanced Logic Circuits & Design – Lec" },
                            { code: "CpE 316L", name: "Advanced Logic Circuits & Design – Lab" },
                            { code: "GE 07", name: "Environmental Science" }
                        ],
                        "2nd Sem": [
                            { code: "CpE 321", name: "CpE Practice and Design Project 1" },
                            { code: "CpE 322", name: "Microprocessor System – Lec" },
                            { code: "CpE 322L", name: "Microprocessor System – Lab" },
                            { code: "CpE 323", name: "Computer Networks & Security – Lec" },
                            { code: "CpE 323L", name: "Computer Networks & Security – Lab" },
                            { code: "CpE 324", name: "CpE Laws and Professional Practice" },
                            { code: "ECE 322", name: "Feedback and Control Systems" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ],
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "CpE 331", name: "Elective 1" },
                            { code: "BOHS 1", name: "Basic Occupational Safety and Health" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "CpE 411", name: "CpE Practice and Design Project 2" },
                            { code: "CpE 412", name: "Emerging Technologies in CpE" },
                            { code: "CpE 413", name: "Digital Signal Processing - Lec" },
                            { code: "CpE 413L", name: "Digital Signal Processing - Lab" },
                            { code: "CpE 414", name: "Elective 2" },
                            { code: "CpE 415", name: "Embedded Systems - Lec" },
                            { code: "CpE 415L", name: "Embedded Systems - Lab" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ],
                        "2nd Sem": [
                            { code: "CpE 421", name: "Elective 3" },
                            { code: "SFT 1", name: "Seminars and Field Trips" },
                            { code: "CpEOJT", name: "OJT (240-hours)" }
                        ]
                    }
                },
                "Curriculum 2026-2027": {
                    1: {
                        "1st Sem": [
                            { code: "ENGMATH", name: "Engineering Mathematics" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "CpE 111", name: "Computer Engineering as a Discipline" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "General Chemistry for Engineers – Lab" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "OP-Siena Identity and Christian" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "Civic Welfare Training Service 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 1", name: "Physics for Engineers – Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers – Lab" },
                            { code: "CpE 121L", name: "Comp Prog’g Logic & Design (C++)" },
                            { code: "DISMAT 1", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "Salvation History (Old and New Testament)" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "Civic Welfare Training Service 2" },
                            { code: "GE ELEC 06", name: "People and the Earth’s Ecosystems" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "ENGDAT 1", name: "Engineering Data Analysis" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "CpE 211L", name: "Object Oriented Programming (OOP w/ Database)" },
                            { code: "CIRCUITS 1", name: "Fundamentals of Electrical Circuits – Lec" },
                            { code: "CIRCUITS 1L", name: "Fundamentals of Electrical Circuits – Lab" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "CpE 221", name: "System Fundamentals" },
                            { code: "CpE 222L", name: "Data Structures & Algorithms" },
                            { code: "CpE 223", name: "Numerical Methods" },
                            { code: "ELECS 1", name: "Fundamentals of Electronic Circuits – Lec" },
                            { code: "ELECS 1L", name: "Fundamentals of Electronic Circuits – Lab" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ],
                        "Mid Year": [
                            { code: "CpE 231", name: "Logic Circuits & Design – Lec" },
                            { code: "CpE 231L", name: "Logic Circuits & Design – Lab" },
                            { code: "CpE 232", name: "Data and Digital Communications" },
                            { code: "CpE 233", name: "Fundamentals of Mixed Signals and Sensors" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "RESEARCH 1", name: "Methods of Research" },
                            { code: "CpE 311", name: "Computer Engineering Drafting & Design" },
                            { code: "CpE 312", name: "Computer Architecture and Org – Lec" },
                            { code: "CpE 312L", name: "Computer Architecture and Org – Lab" },
                            { code: "CpE 313", name: "Software Design – Lec" },
                            { code: "CpE 313L", name: "Software Design – Lab" },
                            { code: "CpE 314", name: "Operating Systems" },
                            { code: "CpE 315", name: "Introduction to HDL" },
                            { code: "CpE 316", name: "Advanced Logic Circuits & Design – Lec" },
                            { code: "CpE 316L", name: "Advanced Logic Circuits & Design – Lab" },
                            { code: "GE 07", name: "Environmental Science" }
                        ],
                        "2nd Sem": [
                            { code: "CpE 321", name: "CpE Practice and Design Project 1" },
                            { code: "CpE 322", name: "Microprocessor System – Lec" },
                            { code: "CpE 322L", name: "Microprocessor System – Lab" },
                            { code: "CpE 323", name: "Computer Networks & Security – Lec" },
                            { code: "CpE 323L", name: "Computer Networks & Security – Lab" },
                            { code: "CpE 324", name: "CpE Laws and Professional Practice" },
                            { code: "ECE 322", name: "Feedback and Control Systems" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ],
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "CpE 331", name: "Elective 1" },
                            { code: "BOHS 1", name: "Basic Occupational Safety and Health" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "CpE 411", name: "CpE Practice and Design Project 2" },
                            { code: "CpE 412", name: "Emerging Technologies in CpE" },
                            { code: "CpE 413", name: "Digital Signal Processing - Lec" },
                            { code: "CpE 413L", name: "Digital Signal Processing - Lab" },
                            { code: "CpE 414", name: "Elective 2" },
                            { code: "CpE 415", name: "Embedded Systems - Lec" },
                            { code: "CpE 415L", name: "Embedded Systems - Lab" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ],
                        "2nd Sem": [
                            { code: "CpE 421", name: "Elective 3" },
                            { code: "SFT 1", name: "Seminars and Field Trips" },
                            { code: "CpEOJT", name: "OJT (240-hours)" }
                        ]
                    }
                }
            },
            "BSECE": {
                "Curriculum 2022-2023": {
                    1: {
                        "1st Sem": [
                            { code: "MATH 101", name: "Remedial in Mathematics" },
                            { code: "IT 111", name: "I.T. Fundamentals" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "General Chemistry for Engineers – Lab" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 2", name: "Physics 2 Lec" },
                            { code: "PHYSICS 2L", name: "Physics 2 Lab" },
                            { code: "PHYSICS 1", name: "Physics for Engineers – Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers – Lab" },
                            { code: "ECE 121", name: "Material Science and Engineering" },
                            { code: "CPE 121L", name: "Computer Programming for ECE" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "GE ELECS 05", name: "The Entrepreneurial Mind" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "ENVSE 1", name: "Environmental Science and Engineering" },
                            { code: "ENGDAT 1", name: "Engineering Data Analysis" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "CIRCUITS 1", name: "Circuits 1 - Lec" },
                            { code: "CIRCUITS 1L", name: "Circuits 1 - Lab" },
                            { code: "ELECS 1", name: "Electronic Devices and Circuits - Lec" },
                            { code: "ELECS 1L", name: "Electronic Devices and Circuits - Lab" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "CIRCUITS 2", name: "Circuits 2 - Lec" },
                            { code: "CIRCUITS 2L", name: "Circuits 2 - Lab" },
                            { code: "ELECS 2", name: "Electronic Circuit Analysis & Design - Lec" },
                            { code: "ELECS 2L", name: "Electronic Circuit Analysis & Design - Lab" },
                            { code: "ADV MATH 1", name: "Principle of Communication System - Lec" },
                            { code: "ADV MATH 1L", name: "Principle of Communication System - Lab" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ],
                        "Mid Year": [
                            { code: "ADV MATH 1", name: "Advanced Mathematics for ECE - Lec" },
                            { code: "ADV MATH 1L", name: "Advanced Mathematics for ECE - Lab" },
                            { code: "CpE 231", name: "Logic Cicuits & Design - Lec" },
                            { code: "CpE 231L", name: "Logic Cicuits & Design - Lab" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "RESEARCH 1", name: "Methods of Research for ECE" },
                            { code: "ECE 311", name: "Signal, Spectra & Signal Processing - Lec" },
                            { code: "ECE 311L", name: "Signal, Spectra & Signal Processing - Lab" },
                            { code: "ECE 312", name: "Modulation and Coding Techniques - Lec" },
                            { code: "ECE 312L", name: "Modulation and Coding Techniques - Lab" },
                            { code: "ECE 313", name: "Electronics 3 - Lec" },
                            { code: "ECE 313L", name: "Electronics 3 - Lab" },
                            { code: "ECE 314", name: "Electromagnetics" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" },
                            { code: "GE 07", name: "The Contemporary World" }
                        ],
                        "2nd Sem": [
                            { code: "ECE 321", name: "ECE Design Project 1" },
                            { code: "ECE 322", name: "Feedback and Control Systems - Lec" },
                            { code: "ECE 322 L", name: "Feedback and Control Systems - Lab" },
                            { code: "ECE 323", name: "Microprocessor & Microcontroller System - Lec" },
                            { code: "ECE 323L", name: "Microprocessor & Microcontroller System - Lab" },
                            { code: "ECE 324", name: "Transmission Meida & Antenna System - Lec" },
                            { code: "ECE 324L", name: "Transmission Meida & Antenna System - Lab" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" }
                        ],
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "ECE 331", name: "Data Communication - Lec" },
                            { code: "ECE 331L", name: "Data Communication - Lab" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "ENGMGT 1", name: "Engineering Management" },
                            { code: "ECE 411", name: "ECE Design Project 2" },
                            { code: "ECE 412", name: "ECE Elective 1 - Lec" },
                            { code: "ECE 412L", name: "ECE Elective 1 - Lab" },
                            { code: "ECE 413", name: "ECE Laws, Contracts, Ethics, Standard, & Safety" },
                            { code: "CpE 323", name: "Computer Network & Security - Lec" },
                            { code: "CpE 323L", name: "Computer Network & Security - Lab" }
                        ],
                        "2nd Sem": [
                            { code: "ECE 421", name: "ECE Elective 2 - Lec" },
                            { code: "ECE 421L", name: "ECE Elective 2 - Lab" },
                            { code: "SFT 1", name: "Seminars and Field Trips" },
                            { code: "ECE OJT", name: "ECE On-the-Job Training (240 Hours)" }
                        ]
                    }
                },
                "Curriculum 2026-2027": {
                    1: {
                        "1st Sem": [
                            { code: "ENGMATH", name: "Engineering Mathematics" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "General Chemistry for Engineers – Lab" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "OP-Siena Identity and Christian" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "Civic Welfare Training Service 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 1", name: "Physics for Engineers – Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers – Lab" },
                            { code: "PHYSICS 2", name: "Physics 2 – Lec" },
                            { code: "PHYSICS 2L", name: "Physics 2 – Lab" },
                            { code: "CpE 121L", name: "Comp Prog'g Logic & Design" },
                            { code: "ECE 121", name: "Material Science and Engineering" },
                            { code: "GE ELEC 06", name: "People and the Earth's Ecosystems" },
                            { code: "THEO 2", name: "Salvation History" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "Civic Welfare Training Service 2" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "ENGDAT 1", name: "Engineering Data Analysis" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "ECE 211", name: "Circuits 1 - Lec" },
                            { code: "ECE 211L", name: "Circuits 1 - Lab" },
                            { code: "ECE 212", name: "Electronic Devices and Circuits - Lec" },
                            { code: "ECE 212L", name: "Electronic Devices and Circuits - Lab" },
                            { code: "ENVSE 1", name: "Environmental Science and Engineering" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "ECE 221", name: "Circuits 2 - Lec" },
                            { code: "ECE 221L", name: "Circuits 2 - Lab" },
                            { code: "ADV MATH 1", name: "Principle of Communication of System - Lec" },
                            { code: "ADV MATH 1L", name: "Principle of Communication of System - Lab" },
                            { code: "ECE 223", name: "Electronics 2 - Lec" },
                            { code: "ECE 223L", name: "Electronics 2 - Lab" },
                            { code: "GE 01", name: "Purposeive Communication" },
                            { code: "PATHFIT 4", name: "Sports" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "THEO 4", name: "Fundamentals of Morality" }
                        ],
                        "Mid Year": [
                            { code: "ADV MATH 1", name: "Advanced Engineering Mathematics for ECE - Lec" },
                            { code: "ADV MATH 1L", name: "Advanced Engineering Mathematics for ECE - Lab " },
                            { code: "CpE 231", name: "Logic Circuit & Design - Lec" },
                            { code: "CpE 231L", name: "Logic Circuit & Design - Lab" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "RESEARCH 1", name: "Methods of Research for ECE" },
                            { code: "ECE 311", name: "Signal, Spectra & Signal Processing - Lec" },
                            { code: "ECE 311L", name: "Signal, Spectra & Signal Processing - Lab" },
                            { code: "ECE 312", name: "Modulation and Coding Techniques - Lec" },
                            { code: "ECE 312L", name: "Modulation and Coding Techniques - Lab" },
                            { code: "ECE 313", name: "Electronics 3 - Lec" },
                            { code: "ECE 313L", name: "Electronics 3 - Lab" },
                            { code: "ECE 314", name: "Electromagnetics" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" },
                            { code: "GE 07", name: "The Contemporary World" }
                        ],
                        "2nd Sem": [
                            { code: "ECE 321", name: "ECE Design Project 1" },
                            { code: "ECE 322", name: "Feedback and Control Systems - Lec" },
                            { code: "ECE 322 L", name: "Feedback and Control Systems - Lab" },
                            { code: "ECE 323", name: "Microprocessor & Microcontroller System - Lec" },
                            { code: "ECE 323L", name: "Microprocessor & Microcontroller System - Lab" },
                            { code: "ECE 324", name: "Transmission Meida & Antenna System - Lec" },
                            { code: "ECE 324L", name: "Transmission Meida & Antenna System - Lab" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" }
                        ],
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "ECE 331", name: "Data Communication - Lec" },
                            { code: "ECE 331L", name: "Data Communication - Lab" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "ENGMGT 1", name: "Engineering Management" },
                            { code: "ECE 411", name: "ECE Design Project 2" },
                            { code: "ECE 412", name: "ECE Elective 1 - Lec" },
                            { code: "ECE 412L", name: "ECE Elective 1 - Lab" },
                            { code: "ECE 413", name: "ECE Laws, Contracts, Ethics, Standard, & Safety" },
                            { code: "CpE 323", name: "Computer Network & Security - Lec" },
                            { code: "CpE 323L", name: "Computer Network & Security - Lab" }
                        ],
                        "2nd Sem": [
                            { code: "ECE 421", name: "ECE Elective 2 - Lec" },
                            { code: "ECE 421L", name: "ECE Elective 2 - Lab" },
                            { code: "SFT 1", name: "Seminars and Field Trips" },
                            { code: "ECE OJT", name: "ECE On-the-Job Training (240 Hours)" }
                        ]
                    }
                }
            },
            "BSIE": {
                "Curriculum 2022-2023": {
                    1: {
                        "1st Sem": [
                            { code: "MATH 101", name: "Remedial in Mathematics" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "Industrial Engineering Orientation" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "IT 111", name: "I.T. Fundamentals" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 1", name: "Physics for Engineers - Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers - Lab" },
                            { code: "CpE 121L", name: "Comp Prog'g Logic & Design (C++)" },
                            { code: "DISMAT 1", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "GE ELEC 05", name: "Entrepreneurial Mind" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "IE 211", name: "Statistical Analysis for Ind. Eng. 1" },
                            { code: "IE 212", name: "Industrial Organization and Management" },
                            { code: "IE 213", name: "IndL Materials and Processes - Lec" },
                            { code: "IE 213L", name: "IndL Materials and Processes - Lab" },
                            { code: "IE 214", name: "Financial Accounting" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "ADV MATH 1", name: "Advance Engineering Mathematics" },
                            { code: "ENG MATH 1", name: "Engineering Mechanics" },
                            { code: "IE 221", name: "Work, Study and Measurement - Lec" },
                            { code: "IE 221L", name: "Work, Study and Measurement - Lab" },
                            { code: "IE 222", name: "Managerial Accounting" },
                            { code: "IE 223", name: "Statistical, Analysis for IndL. Engineering 2" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ],
                        "Mid Year": [
                            { code: "IE 231", name: "Quality Management System" },
                            { code: "IE 232", name: "Operation Research 1" },
                            { code: "IE 233", name: "Principle of Economics" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "IE 311", name: "Operations Management - Lec" },
                            { code: "IE 311L", name: "Operations Management - Lab" },
                            { code: "IE 312", name: "Ergonomics 1" },
                            { code: "IE 313", name: "Thermodymaics" },
                            { code: "EEENG 1", name: "Elementary Electrical Engineering" },
                            { code: "ENVSE 1", name: "Environmental Science and Engineering" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ],
                        "2nd Sem": [
                            { code: "IE 321", name: "Operations Research 2" },
                            { code: "IE 322", name: "IndL. Matls. & Processes w/ CADCAM - Lec" },
                            { code: "IE 322L", name: "IndL. Matls. & Processes w/ CADCAM - Lab" },
                            { code: "IE 323", name: "Project Feasibility 1" },
                            { code: "IE 324", name: "Ergonomics 2" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "GE 09", name: "Rizal's Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ],
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "IE 331", name: "Elective 1" },
                            { code: "BOSH 1", name: "Basic Occupational Safety and Health" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "ENGMGT", name: "Engineering Management" },
                            { code: "IE 411", name: "Project Feasibility 2" },
                            { code: "IE 412", name: "Information Systems" },
                            { code: "IE 413", name: "IE Capstone Project - Lec" },
                            { code: "IE 413L", name: "IE Capstone Project - Lab" },
                            { code: "IE 414", name: "System Engineering" },
                            { code: "IE 415", name: "Supply Chain Management" },
                            { code: "IE 416", name: "Elective 2" }
                        ],
                        "2nd Sem": [
                            { code: "IE 422", name: "Elective 3" },
                            { code: "SFT 1", name: "IE Seminars and Field Trips" },
                            { code: "IE OJT", name: "IE Industry Immersion (240 hours)" }
                        ]
                    }
                },
                "Curriculum 2026-2027": {
                    1: {
                        "1st Sem": [
                            { code: "ENGMATH 1", name: "Engineering Mathematics" },
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "GENCHEM 1", name: "General Chemistry for Engineers - Lec" },
                            { code: "GENCHEM 1L", name: "Industrial Engineering Orientation" },
                            { code: "DRAW 1", name: "Engineering Drawing" },
                            { code: "GE 03", name: "Mathematics in the Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "INTCAL 1", name: "Integral Calculus" },
                            { code: "PHYSICS 1", name: "Physics for Engineers - Lec" },
                            { code: "PHYSICS 1L", name: "Physics for Engineers - Lab" },
                            { code: "CpE 121L", name: "Comp Prog'g Logic & Design (C++)" },
                            { code: "DISMAT 1", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "GE ELEC 06", name: "People and the Earth's Ecosystems" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: { 
                        "1st Sem": [
                            { code: "DIFEQUI 1", name: "Differential Equations" },
                            { code: "DRAW 2", name: "Computer-Aided Drafting" },
                            { code: "IE 211", name: "Statistical Analysis for Ind. Eng. 1" },
                            { code: "IE 212", name: "Industrial Organization and Management" },
                            { code: "IE 213", name: "IndL Materials and Processes - Lec" },
                            { code: "IE 213L", name: "IndL Materials and Processes - Lab" },
                            { code: "IE 214", name: "Financial Accounting" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ], 
                        "2nd Sem": [
                            { code: "ENGECO 1", name: "Engineering Economics" },
                            { code: "ADV MATH 1", name: "Advance Engineering Mathematics" },
                            { code: "ENG MATH 1", name: "Engineering Mechanics" },
                            { code: "IE 221", name: "Work, Study and Measurement - Lec" },
                            { code: "IE 221L", name: "Work, Study and Measurement - Lab" },
                            { code: "IE 222", name: "Managerial Accounting" },
                            { code: "IE 223", name: "Statistical, Analysis for IndL. Engineering 2" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ], 
                        "Mid Year": [
                            { code: "IE 231", name: "Quality Management System" },
                            { code: "IE 232", name: "Operation Research 1" },
                            { code: "IE 233", name: "Principle of Economics" }
                        ] 
                    },
                    3: { 
                        "1st Sem": [
                            { code: "IE 311", name: "Operations Management - Lec" },
                            { code: "IE 311L", name: "Operations Management - Lab" },
                            { code: "IE 312", name: "Ergonomics 1" },
                            { code: "IE 313", name: "Thermodymaics" },
                            { code: "EEENG 1", name: "Elementary Electrical Engineering" },
                            { code: "ENVSE 1", name: "Environmental Science and Engineering" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ], 
                        "2nd Sem": [
                            { code: "IE 321", name: "Operations Research 2" },
                            { code: "IE 322", name: "IndL. Matls. & Processes w/ CADCAM - Lec" },
                            { code: "IE 322L", name: "IndL. Matls. & Processes w/ CADCAM - Lab" },
                            { code: "IE 323", name: "Project Feasibility 1" },
                            { code: "IE 324", name: "Ergonomics 2" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "GE 09", name: "Rizal's Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ], 
                        "Mid Year": [
                            { code: "TECHNOP 1", name: "Technopreneurship 101" },
                            { code: "IE 331", name: "Elective 1" },
                            { code: "BOSH 1", name: "Basic Occupational Safety and Health" }
                        ] 
                    },
                    4: { 
                        "1st Sem": [
                            { code: "ENGMGT", name: "Engineering Management" },
                            { code: "IE 411", name: "Project Feasibility 2" },
                            { code: "IE 412", name: "Information Systems" },
                            { code: "IE 413", name: "IE Capstone Project - Lec" },
                            { code: "IE 413L", name: "IE Capstone Project - Lab" },
                            { code: "IE 414", name: "System Engineering" },
                            { code: "IE 415", name: "Supply Chain Management" },
                            { code: "IE 416", name: "Elective 2" }
                        ], 
                        "2nd Sem": [
                            { code: "IE 422", name: "Elective 3" },
                            { code: "SFT 1", name: "IE Seminars and Field Trips" },
                            { code: "IE OJT", name: "IE Industry Immersion (240 hours)" }
                        ] 
                    }
                }
            },
            "BSCS": {
                "Curriculum 2023-2024": {
                    1: {
                        "1st Sem": [
                            { code: "CS 111", name: "Introduction to Computing" },
                            { code: "CS 112", name: "Computer Programming 1 w/ Logic Formulation - Lec" },
                            { code: "CS 112L", name: "Computer Programming 1 w/ Logic Formulation - Lab" },
                            { code: "GE 03", name: "Mathematics in Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "CS 121", name: "Data Structures & Algorithms - Lec" },
                            { code: "CS 121L", name: "Data Structures & Algorithms - Lab" },
                            { code: "CS 122", name: "Computer Programming 2 - Lec" },
                            { code: "CS 122L", name: "Computer Programming 2 - Lab" },
                            { code: "CS 123", name: "Discrete Structures 1" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "CS 211", name: "Object Oriented Programming 1 - Lec" },
                            { code: "CS 211L", name: "Object Oriented Programming 1 - Lab" },
                            { code: "CS 212", name: "Algorithms & Complexity" },
                            { code: "CS 213", name: "Discrete Structures 2" },
                            { code: "CS 214", name: "Professional Elective 1 - Lec" },
                            { code: "CS 214L", name: "Professional Elective 1 - Lab" },
                            { code: "GE 02", name: "Reading in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy, & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "CS 221", name: "Information Management - Lec" },
                            { code: "CS 221L", name: "Information Management - Lab" },
                            { code: "CS 222", name: "Architecture & Organization - Lec" },
                            { code: "CS 222L", name: "Architecture & Organization - Lab" },
                            { code: "CS 223", name: "Professional Elective 2 - Lec" },
                            { code: "CS 223L", name: "Professional Elective 2 - Lec" },
                            { code: "CS 224", name: "Object Oriented Programming 2 - Lec" },
                            { code: "CS 224L", name: "Object Oriented Programming 2 - Lab" },
                            { code: "GE 05", name: "Science, Technology, & Society" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "CS 311", name: "Software Engineering 1 - Lec" },
                            { code: "CS 311L", name: "Software Engineering 1 - Lab" },
                            { code: "CS 312", name: "Information Assurance and Security - Lec" },
                            { code: "CS 313", name: "Operating System - Lec" },
                            { code: "CS 313L", name: "Operating System - Lab" },
                            { code: "CS 323", name: "Computer Networks - Lec" },
                            { code: "CS 323L", name: "Computer Networks - Lab" },
                            { code: "CS 315", name: "Professional Elective 3 - Lec" },
                            { code: "CS 315L", name: "Professional Elective 3 - Lab" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE O1", name: "Environmental Science" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ],
                        "2nd Sem": [
                            { code: "CS 321", name: "Thesis 1" },
                            { code: "CS 322", name: "Applications Development and Emerging Technologies - Lec" },
                            { code: "CS 322L", name: "Applications Development and Emerging Technologies - Lab" },
                            { code: "CS 333", name: "Network Administration - Lec" },
                            { code: "CS 333L", name: "Network Administration - Lab" },
                            { code: "CS 324", name: "Software Engineering 2 - Lec" },
                            { code: "CS 324L", name: "Software Engineering 2 - Lab" },
                            { code: "CS 331", name: "Automata & Language Theory" },
                            { code: "GE 09", name: "Rizal's Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ],
                        "Mid Year": [
                            { code: "CS 414", name: "Wireless Network - Lec" },
                            { code: "CS 414L", name: "Wireless Network - Lab" },
                            { code: "CS 332", name: "Cybers Security" },
                            { code: "CS 314", name: "Programming Languages - Lec" },
                            { code: "CS 314L", name: "Programming Languages - Lab" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "CS 411", name: "Thesis 2" },
                            { code: "CS 412", name: "Social Issues and Professional Practice" },
                            { code: "CS 413", name: "Human Computer Interaction" },
                            { code: "CS 421", name: "Network Security - Lec" },
                            { code: "CS 421L", name: "Network Security - Lab" },
                            { code: "CS 415", name: "Project Management" }
                        ],
                        "2nd Sem": [
                            { code: "GE 06", name: "Ethics" },
                            { code: "CS 422", name: "Practicum (240 hrs)" }
                        ]
                    }
                },
                "Curriculum 2026-2027": {
                    1: {
                        "1st Sem": [
                            { code: "CS 111", name: "Introduction to Computing" },
                            { code: "CS 112", name: "Computer Programming 1 w/ Logic Formulation - Lec" },
                            { code: "CS 112L", name: "Computer Programming 1 w/ Logic Formulation - Lab" },
                            { code: "GE 03", name: "Mathematics in Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "CS 121", name: "Data Structures & Algorithms - Lec" },
                            { code: "CS 121L", name: "Data Structures & Algorithms - Lab" },
                            { code: "CS 122", name: "Computer Programming 2 - Lec" },
                            { code: "CS 122L", name: "Computer Programming 2 - Lab" },
                            { code: "CS 123", name: "Discrete Structures 1" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: { 
                        "1st Sem": [
                            { code: "DIFCAL 1", name: "Differential Calculus" },
                            { code: "CS 211", name: "Object Oriented Programming 1 - Lec" },
                            { code: "CS 211L", name: "Object Oriented Programming 1 - Lab" },
                            { code: "CS 212", name: "Algorithms & Complexity" },
                            { code: "CS 213", name: "Discrete Structures 2" },
                            { code: "CS 214", name: "Professional Elective 1 - Lec" },
                            { code: "CS 214L", name: "Professional Elective 1 - Lab" },
                            { code: "GE 02", name: "Reading in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy, & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ], 
                        "2nd Sem": [
                            { code: "CS 221", name: "Information Management - Lec" },
                            { code: "CS 221L", name: "Information Management - Lab" },
                            { code: "CS 222", name: "Architecture & Organization - Lec" },
                            { code: "CS 222L", name: "Architecture & Organization - Lab" },
                            { code: "CS 223", name: "Professional Elective 2 - Lec" },
                            { code: "CS 223L", name: "Professional Elective 2 - Lec" },
                            { code: "CS 224", name: "Object Oriented Programming 2 - Lec" },
                            { code: "CS 224L", name: "Object Oriented Programming 2 - Lab" },
                            { code: "GE 05", name: "Science, Technology, & Society" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ] 
                    },
                    3: { 
                        "1st Sem": [
                            { code: "CS 311", name: "Software Engineering 1 - Lec" },
                            { code: "CS 311L", name: "Software Engineering 1 - Lab" },
                            { code: "CS 312", name: "Information Assurance and Security - Lec" },
                            { code: "CS 313", name: "Operating System - Lec" },
                            { code: "CS 313L", name: "Operating System - Lab" },
                            { code: "CS 323", name: "Computer Networks - Lec" },
                            { code: "CS 323L", name: "Computer Networks - Lab" },
                            { code: "CS 315", name: "Professional Elective 3 - Lec" },
                            { code: "CS 315L", name: "Professional Elective 3 - Lab" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE O1", name: "Environmental Science" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ], 
                        "2nd Sem": [
                            { code: "CS 321", name: "Thesis 1" },
                            { code: "CS 322", name: "Applications Development and Emerging Technologies - Lec" },
                            { code: "CS 322L", name: "Applications Development and Emerging Technologies - Lab" },
                            { code: "CS 333", name: "Network Administration - Lec" },
                            { code: "CS 333L", name: "Network Administration - Lab" },
                            { code: "CS 324", name: "Software Engineering 2 - Lec" },
                            { code: "CS 324L", name: "Software Engineering 2 - Lab" },
                            { code: "CS 331", name: "Automata & Language Theory" },
                            { code: "GE 09", name: "Rizal's Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ], 
                        "Mid Year": [
                            { code: "CS 414", name: "Wireless Network - Lec" },
                            { code: "CS 414L", name: "Wireless Network - Lab" },
                            { code: "CS 332", name: "Cybers Security" },
                            { code: "CS 314", name: "Programming Languages - Lec" },
                            { code: "CS 314L", name: "Programming Languages - Lab" }
                        ] 
                    },
                    4: { 
                        "1st Sem": [
                            { code: "CS 411", name: "Thesis 2" },
                            { code: "CS 412", name: "Social Issues and Professional Practice" },
                            { code: "CS 413", name: "Human Computer Interaction" },
                            { code: "CS 421", name: "Network Security - Lec" },
                            { code: "CS 421L", name: "Network Security - Lab" },
                            { code: "CS 415", name: "Project Management" }
                        ], 
                        "2nd Sem": [
                            { code: "GE 06", name: "Ethics" },
                            { code: "CS 422", name: "Practicum (240 hrs)" }
                        ] 
                    }
                }
            },
            "BSIT": {
                "Curriculum 2023-2024": {
                    1: {
                        "1st Sem": [
                            { code: "IT 111", name: "Introduction to Computing" },
                            { code: "IT 112", name: "Computer Programming 1 w/ Logic Formulation - Lec" },
                            { code: "IT 112L", name: "Computer Programming 1 w/ Logic Formulation - Lab" },
                            { code: "GE 03", name: "Mathematics in Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "IT 121", name: "Data Structures & Algorithms - Lec" },
                            { code: "IT 121L", name: "Data Structures & Algorithms - Lab" },
                            { code: "IT 122", name: "Computer Programming 2 - Lec" },
                            { code: "IT 122L", name: "Computer Programming 2 - Lab" },
                            { code: "IT 123", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: {
                        "1st Sem": [
                            { code: "IT 211", name: "Information Management - Lec" },
                            { code: "IT 211L", name: "Information Management - Lab" },
                            { code: "IT 212", name: "Introduction to Human Computer Interaction" },
                            { code: "IT 213", name: "Integrative Programming and Technologies 1 (JAVA) - Lec" },
                            { code: "IT 213L", name: "Integrative Programming and Technologies 1 (JAVA) - Lab" },
                            { code: "IT 214", name: "Professional Elective 1 - Lec" },
                            { code: "IT 214L", name: "Professional Elective 1 - Lab" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy, & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ],
                        "2nd Sem": [
                            { code: "IT 221", name: "Advance Database Systems - Lec" },
                            { code: "IT 221L", name: "Advance Database Systems - Lab" },
                            { code: "IT 222", name: "System Integration & Architecture 1 - Lec" },
                            { code: "IT 222L", name: "System Integration & Architecture 1 - Lab" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "IT 224", name: "System Fundamentals" },
                            { code: "IT 225", name: "Professional Elective 2 - Lec" },
                            { code: "IT 225L", name: "Professional Elective 2 - Lab" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ]
                    },
                    3: {
                        "1st Sem": [
                            { code: "IT 311", name: "Information Assurance and Security 1 - Lec" },
                            { code: "IT 311L", name: "Information Assurance and Security 1 - Lab" },
                            { code: "IT 312", name: "Computer Networks - Lec" },
                            { code: "IT 312L", name: "Computer Networks - Lab" },
                            { code: "IT 324", name: "It Project Management" },
                            { code: "IT 314", name: "Professional Elective 3 - Lec" },
                            { code: "IT 314L", name: "Professional Elective 3 - Lab" },
                            { code: "IT 223", name: "Operating Systems" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE ELEC 01", name: "Environmental Science" }
                        ],
                        "2nd Sem": [
                            { code: "IT 321", name: "Capstone Project & Research 1" },
                            { code: "IT 322", name: "Applications Development and Emerging Technologies - Lec" },
                            { code: "IT 322L", name: "Applications Development and Emerging Technologies - Lab" },
                            { code: "IT 323", name: "Information Assurance and Security 2 - Lec" },
                            { code: "IT 323L", name: "Information Assurance and Security 2 - Lab" },
                            { code: "IT 332", name: "Network Administration - Lec" },
                            { code: "IT 332L", name: "Network Administration - Lab" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ],
                        "Mid Year": [
                            { code: "IT 414", name: "Wireless Network - Lec" },
                            { code: "IT 414L", name: "Wireless Network - Lab" },
                            { code: "IT 331", name: "Cyber Security" },
                            { code: "IT 325", name: "Professional Elective 4 - Lec" },
                            { code: "IT 325L", name: "Professional Elective 4 - Lab" }
                        ]
                    },
                    4: {
                        "1st Sem": [
                            { code: "IT 411", name: "Capstone Project & Research 2" },
                            { code: "IT 412", name: "Social Issues & Professional Practice" },
                            { code: "IT 413", name: "System Administration and Maintenance - Lec" },
                            { code: "IT 413L", name: "System Administration and Maintenance - Lab" },
                            { code: "IT 313", name: "Quantitative Methods (Modeling and Simulation)" },
                            { code: "IT 422", name: "Network Security - Lec" },
                            { code: "IT 422L", name: "Network Security - Lab" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ],
                        "2nd Sem": [
                            { code: "IT OJT", name: "IT Practicum / Internship (486 Hours)" }
                        ]
                    }
                },
                "Curriculum 2026-2027": {
                    1: {
                        "1st Sem": [
                            { code: "IT 111", name: "Introduction to Computing" },
                            { code: "IT 112", name: "Computer Programming 1 w/ Logic Formulation - Lec" },
                            { code: "IT 112L", name: "Computer Programming 1 w/ Logic Formulation - Lab" },
                            { code: "GE 03", name: "Mathematics in Modern World" },
                            { code: "GE 04", name: "Understanding the Self" },
                            { code: "THEO 1", name: "Salvation History" },
                            { code: "PATHFIT 1", name: "Movement Competency Training" },
                            { code: "NSTP 1", name: "National Service Training Program 1" }
                        ],
                        "2nd Sem": [
                            { code: "IT 121", name: "Data Structures & Algorithms - Lec" },
                            { code: "IT 121L", name: "Data Structures & Algorithms - Lab" },
                            { code: "IT 122", name: "Computer Programming 2 - Lec" },
                            { code: "IT 122L", name: "Computer Programming 2 - Lab" },
                            { code: "IT 123", name: "Discrete Mathematics" },
                            { code: "GE 01", name: "Purposive Communication" },
                            { code: "THEO 2", name: "The Gospel/Christology" },
                            { code: "PATHFIT 2", name: "Exercise-based Fitness Activities" },
                            { code: "NSTP 2", name: "National Service Training Program 2" }
                        ]
                    },
                    2: { 
                        "1st Sem": [
                            { code: "IT 211", name: "Information Management - Lec" },
                            { code: "IT 211L", name: "Information Management - Lab" },
                            { code: "IT 212", name: "Introduction to Human Computer Interaction" },
                            { code: "IT 213", name: "Integrative Programming and Technologies 1 (JAVA) - Lec" },
                            { code: "IT 213L", name: "Integrative Programming and Technologies 1 (JAVA) - Lab" },
                            { code: "IT 214", name: "Professional Elective 1 - Lec" },
                            { code: "IT 214L", name: "Professional Elective 1 - Lab" },
                            { code: "GE 02", name: "Readings in Philippine History" },
                            { code: "THEO 3", name: "Church, Liturgy, & Sacraments" },
                            { code: "PATHFIT 3", name: "Martial Arts" }
                        ], 
                        "2nd Sem": [
                            { code: "IT 221", name: "Advance Database Systems - Lec" },
                            { code: "IT 221L", name: "Advance Database Systems - Lab" },
                            { code: "IT 222", name: "System Integration & Architecture 1 - Lec" },
                            { code: "IT 222L", name: "System Integration & Architecture 1 - Lab" },
                            { code: "GE 08", name: "Arts Appreciation" },
                            { code: "IT 224", name: "System Fundamentals" },
                            { code: "IT 225", name: "Professional Elective 2 - Lec" },
                            { code: "IT 225L", name: "Professional Elective 2 - Lab" },
                            { code: "GE 05", name: "Science, Technology, and Society" },
                            { code: "THEO 4", name: "Fundamentals of Morality" },
                            { code: "PATHFIT 4", name: "Sports" }
                        ] 
                    },
                    3: { 
                        "1st Sem": [
                            { code: "IT 311", name: "Information Assurance and Security 1 - Lec" },
                            { code: "IT 311L", name: "Information Assurance and Security 1 - Lab" },
                            { code: "IT 312", name: "Computer Networks - Lec" },
                            { code: "IT 312L", name: "Computer Networks - Lab" },
                            { code: "IT 324", name: "It Project Management" },
                            { code: "IT 314", name: "Professional Elective 3 - Lec" },
                            { code: "IT 314L", name: "Professional Elective 3 - Lab" },
                            { code: "IT 223", name: "Operating Systems" },
                            { code: "GE 07", name: "The Contemporary World" },
                            { code: "GE ELEC 01", name: "Environmental Science" }
                        ],
                        "2nd Sem": [
                            { code: "IT 321", name: "Capstone Project & Research 1" },
                            { code: "IT 322", name: "Applications Development and Emerging Technologies - Lec" },
                            { code: "IT 322L", name: "Applications Development and Emerging Technologies - Lab" },
                            { code: "IT 323", name: "Information Assurance and Security 2 - Lec" },
                            { code: "IT 323L", name: "Information Assurance and Security 2 - Lab" },
                            { code: "IT 332", name: "Network Administration - Lec" },
                            { code: "IT 332L", name: "Network Administration - Lab" },
                            { code: "GE 06", name: "Ethics" },
                            { code: "GE 09", name: "Rizal’s Life & Works" },
                            { code: "GE ELEC 04", name: "Philippine Indigenous Communities" }
                        ], 
                        "Mid Year": [
                            { code: "IT 414", name: "Wireless Network - Lec" },
                            { code: "IT 414L", name: "Wireless Network - Lab" },
                            { code: "IT 331", name: "Cyber Security" },
                            { code: "IT 325", name: "Professional Elective 4 - Lec" },
                            { code: "IT 325L", name: "Professional Elective 4 - Lab" }
                        ] 
                    },
                    4: { 
                        "1st Sem": [
                            { code: "IT 411", name: "Capstone Project & Research 2" },
                            { code: "IT 412", name: "Social Issues & Professional Practice" },
                            { code: "IT 413", name: "System Administration and Maintenance - Lec" },
                            { code: "IT 413L", name: "System Administration and Maintenance - Lab" },
                            { code: "IT 313", name: "Quantitative Methods (Modeling and Simulation)" },
                            { code: "IT 422", name: "Network Security - Lec" },
                            { code: "IT 422L", name: "Network Security - Lab" },
                            { code: "GE ELEC 03", name: "Philippine Pop Culture" }
                        ], 
                        "2nd Sem": [
                            { code: "IT 421", name: "IT Practicum / Internship (486 Hours)" }
                        ] 
                    }
                }
            }
        };

export const faculties = [{ id: "comp", name: "كلية الحاسوب" }];
export const departments = [
  { id: "cyber", name: "الأمن السيبراني", facultyId: "comp", majors: ["الأمن السيبراني"], summary: "حماية الأنظمة والشبكات وتحليل الثغرات." },
  { id: "se", name: "هندسة البرمجيات", facultyId: "comp", majors: ["هندسة البرمجيات"], summary: "تصميم الأنظمة والمتطلبات والاختبار والجودة." },
  { id: "it", name: "تقنية المعلومات (IT)", facultyId: "comp", majors: ["تقنية المعلومات"], summary: "البنية التحتية، الشبكات، الدعم الفني وإدارة الأنظمة." },
  { id: "prog", name: "البرمجة", facultyId: "comp", majors: ["البرمجة"], summary: "أساسيات البرمجة والخوارزميات وهياكل البيانات." },
];
export const instructors = [
  { id: "i1", name: "د. علي القحطاني", expertise: ["الأمن السيبراني", "الشبكات"], departmentId: "cyber" },
  { id: "i2", name: "د. مروة الحاج", expertise: ["هندسة البرمجيات", "اختبار البرمجيات"], departmentId: "se" },
  { id: "i3", name: "م. حسام سعيد", expertise: ["تقنية المعلومات", "إدارة الأنظمة"], departmentId: "it" },
  { id: "i4", name: "م. ريم العنسي", expertise: ["البرمجة", "الخوارزميات"], departmentId: "prog" },
];
export const courses = [
  { code: "SEC201", title: "مبادئ الأمن السيبراني", credits: 3, departmentId: "cyber", prereq: [] },
  { code: "NET210", title: "أساسيات الشبكات", credits: 3, departmentId: "cyber", prereq: [] },
  { code: "SWE220", title: "مدخل إلى هندسة البرمجيات", credits: 3, departmentId: "se", prereq: [] },
  { code: "SWE350", title: "اختبار البرمجيات وضمان الجودة", credits: 3, departmentId: "se", prereq: ["SWE220"] },
  { code: "IT200",  title: "أنظمة التشغيل وإدارتها", credits: 3, departmentId: "it", prereq: [] },
  { code: "IT240",  title: "خدمات الشبكات والبنية التحتية", credits: 3, departmentId: "it", prereq: ["NET210"] },
  { code: "PRG101", title: "أساسيات البرمجة", credits: 4, departmentId: "prog", prereq: [] },
  { code: "DS205",  title: "هياكل البيانات", credits: 3, departmentId: "prog", prereq: ["PRG101"] },
];
export const deptMap = Object.fromEntries(departments.map(d => [d.id, d]));
export const courseMap = Object.fromEntries(courses.map(c => [c.code, c]));

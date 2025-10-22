/**
 * Клас для представлення одного студента
 */
class Student {
  constructor(
    lastName,
    firstName,
    middleName,
    phone,
    email,
    birthDate,
    group,
    address,
    educationType,
    grades
  ) {
    this.id = Date.now() + Math.random(); // Унікальний ідентифікатор
    this.lastName = lastName;
    this.firstName = firstName;
    this.middleName = middleName;
    this.phone = phone;
    this.email = email;
    this.birthDate = birthDate;
    this.group = group;
    this.address = address;
    this.educationType = educationType;
    this.grades = grades; // Масив оцінок
    this.averageGrade = this.calculateAverage();
  }

  /**
   * Метод для обчислення середнього балу
   */
  calculateAverage() {
    if (this.grades.length === 0) return 0;
    const sum = this.grades.reduce((acc, grade) => acc + grade, 0);
    return (sum / this.grades.length).toFixed(2);
  }
}

/**
 * Клас для управління студентською групою
 */
class StudentGroup {
  constructor() {
    this.students = [];
    this.loadFromStorage(); // Завантажити дані при ініціалізації
  }

  /**
   * Метод для додавання студента
   */
  addStudent(student) {
    this.students.push(student);
    this.saveToStorage();
  }

  /**
   * Метод для видалення студента за ID
   */
  deleteStudent(id) {
    this.students = this.students.filter((student) => student.id !== id);
    this.saveToStorage();
  }

  /**
   * Метод для пошуку студента за всіма ознаками (крім середнього балу)
   */
  searchStudents(searchTerm) {
    if (!searchTerm) return this.students;

    const term = searchTerm.toLowerCase();
    return this.students.filter((student) => {
      return (
        student.lastName.toLowerCase().includes(term) ||
        student.firstName.toLowerCase().includes(term) ||
        student.middleName.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.birthDate.toLowerCase().includes(term) ||
        student.group.toLowerCase().includes(term) ||
        student.address.toLowerCase().includes(term) ||
        student.educationType.toLowerCase().includes(term)
      );
    });
  }

  /**
   * Метод для оновлення даних студента
   */
  updateStudent(id, updatedData) {
    const index = this.students.findIndex((student) => student.id === id);
    if (index !== -1) {
      // Оновлюємо дані студента
      Object.assign(this.students[index], updatedData);

      // Якщо оновлені оцінки, перераховуємо середній бал
      if (updatedData.grades) {
        this.students[index].averageGrade =
          this.students[index].calculateAverage();
      }

      this.saveToStorage();
    }
  }

  /**
   * Метод для отримання всіх студентів
   */
  getAllStudents() {
    return this.students;
  }

  /**
   * Метод для перевірки унікальності email
   */
  isEmailUnique(email, excludeId = null) {
    return !this.students.some(
      (student) =>
        student.email.toLowerCase() === email.toLowerCase() &&
        student.id !== excludeId
    );
  }

  /**
   * Метод для перевірки унікальності телефону
   */
  isPhoneUnique(phone, excludeId = null) {
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, "");
    return !this.students.some((student) => {
      const studentPhone = student.phone.replace(/[\s\-\(\)]/g, "");
      return studentPhone === normalizedPhone && student.id !== excludeId;
    });
  }

  /**
   * Метод для сортування студентів
   * Підтримує сортування за прізвищем та ім'ям одночасно
   */
  sortStudents(fields, direction = "asc") {
    const sorted = [...this.students].sort((a, b) => {
      // Якщо передано масив полів (прізвище + ім'я)
      if (Array.isArray(fields)) {
        for (let field of fields) {
          let valueA = a[field];
          let valueB = b[field];

          if (field === "averageGrade") {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
          } else if (field === "birthDate") {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          } else {
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
          }

          if (valueA < valueB) return direction === "asc" ? -1 : 1;
          if (valueA > valueB) return direction === "asc" ? 1 : -1;
        }
        return 0;
      } else {
        // Сортування за одним полем
        let valueA = a[fields];
        let valueB = b[fields];

        if (fields === "averageGrade") {
          valueA = parseFloat(valueA);
          valueB = parseFloat(valueB);
        } else if (fields === "birthDate") {
          valueA = new Date(valueA);
          valueB = new Date(valueB);
        } else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }

        if (valueA < valueB) return direction === "asc" ? -1 : 1;
        if (valueA > valueB) return direction === "asc" ? 1 : -1;
        return 0;
      }
    });

    return sorted;
  }

  /**
   * Збереження даних у localStorage
   */
  saveToStorage() {
    localStorage.setItem("studentGroup", JSON.stringify(this.students));
  }

  /**
   * Завантаження даних з localStorage
   */
  loadFromStorage() {
    const data = localStorage.getItem("studentGroup");
    if (data) {
      const studentsData = JSON.parse(data);
      this.students = studentsData.map((s) => {
        const student = new Student(
          s.lastName,
          s.firstName,
          s.middleName,
          s.phone,
          s.email,
          s.birthDate,
          s.group,
          s.address || "",
          s.educationType || "Бюджет",
          s.grades
        );
        student.id = s.id;
        return student;
      });
    }
  }
}

// Ініціалізація групи студентів
const studentGroup = new StudentGroup();

// Змінні для сортування та пошуку
let selectedSortFields = []; // Масив вибраних полів для сортування
let currentSortDirection = null;
let currentSearchTerm = null;
let editingStudentId = null;

/**
 * Функція валідації email
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Функція валідації телефону (українські номери)
 */
function validatePhone(phone) {
  const re = /^\+?3?8?0\d{9}$/;
  return re.test(phone.replace(/[\s\-\(\)]/g, ""));
}

/**
 * Функція валідації оцінок
 */
function validateGrades(gradesString) {
  if (!gradesString.trim()) return { valid: false, message: "Введіть оцінки" };

  const grades = gradesString.trim().split(/\s+/);
  for (let grade of grades) {
    if (isNaN(grade) || grade === "") {
      return { valid: false, message: "Оцінки повинні бути числами" };
    }
    const numGrade = parseFloat(grade);
    if (numGrade < 0 || numGrade > 100) {
      return { valid: false, message: "Оцінки повинні бути від 0 до 100" };
    }
  }
  return { valid: true, grades: grades.map((g) => parseFloat(g)) };
}

/**
 * Функція для відображення помилок
 */
function showError(elementId, message) {
  const errorDiv = document.getElementById(elementId);
  errorDiv.innerHTML = `<div class="error-message">${message}</div>`;
  setTimeout(() => {
    errorDiv.innerHTML = "";
  }, 5000);
}

/**
 * Функція для очищення помилок
 */
function clearError(elementId) {
  document.getElementById(elementId).innerHTML = "";
}

/**
 * Функція додавання студента
 */
function addStudent() {
  clearError("formError");

  // Отримання значень з форми
  const lastName = document.getElementById("lastName").value.trim();
  const firstName = document.getElementById("firstName").value.trim();
  const middleName = document.getElementById("middleName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const birthDate = document.getElementById("birthDate").value;
  const group = document.getElementById("group").value.trim();
  const address = document.getElementById("address").value.trim();
  const educationType = document.getElementById("educationType").value;
  const gradesString = document.getElementById("grades").value.trim();

  // Валідація полів
  if (
    !lastName ||
    !firstName ||
    !middleName ||
    !phone ||
    !email ||
    !birthDate ||
    !group ||
    !address ||
    !educationType ||
    !gradesString
  ) {
    showError("formError", "Будь ласка, заповніть всі поля!");
    return;
  }

  if (!validateEmail(email)) {
    showError("formError", "Введіть коректну електронну пошту!");
    return;
  }

  if (!validatePhone(phone)) {
    showError(
      "formError",
      "Введіть коректний номер телефону (наприклад: +380XXXXXXXXX)!"
    );
    return;
  }

  // Перевірка унікальності email
  if (!studentGroup.isEmailUnique(email)) {
    showError("formError", "Студент з такою електронною поштою вже існує!");
    return;
  }

  // Перевірка унікальності телефону
  if (!studentGroup.isPhoneUnique(phone)) {
    showError("formError", "Студент з таким номером телефону вже існує!");
    return;
  }

  const gradesValidation = validateGrades(gradesString);
  if (!gradesValidation.valid) {
    showError("formError", gradesValidation.message);
    return;
  }

  // Створення нового студента
  const student = new Student(
    lastName,
    firstName,
    middleName,
    phone,
    email,
    birthDate,
    group,
    address,
    educationType,
    gradesValidation.grades
  );

  // Додавання студента до групи
  studentGroup.addStudent(student);

  // Очищення форми
  clearForm();

  // Автоматичне сортування за ім'ям після додавання
  selectedSortFields = ["firstName"];
  currentSortDirection = "asc";
  updateSortButtons();

  // Відображення студентів
  displayStudents();
}

/**
 * Функція очищення форми
 */
function clearForm() {
  document.getElementById("lastName").value = "";
  document.getElementById("firstName").value = "";
  document.getElementById("middleName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
  document.getElementById("birthDate").value = "";
  document.getElementById("group").value = "";
  document.getElementById("address").value = "";
  document.getElementById("educationType").value = "";
  document.getElementById("grades").value = "";
  clearError("formError");
}

/**
 * Функція відображення студентів
 */
function displayStudents() {
  const container = document.getElementById("studentsContainer");
  let students = studentGroup.getAllStudents();

  // Застосування пошуку
  if (currentSearchTerm) {
    students = studentGroup.searchStudents(currentSearchTerm);
  }

  // Застосування сортування
  if (selectedSortFields.length > 0 && currentSortDirection) {
    // Якщо вибрано і прізвище, і ім'я - сортуємо одночасно
    if (
      selectedSortFields.includes("lastName") &&
      selectedSortFields.includes("firstName")
    ) {
      students = studentGroup.sortStudents(
        ["lastName", "firstName"],
        currentSortDirection
      );
    } else if (selectedSortFields.length === 1) {
      students = studentGroup.sortStudents(
        selectedSortFields[0],
        currentSortDirection
      );
    } else {
      // Інші комбінації - сортування за першим полем
      students = studentGroup.sortStudents(
        selectedSortFields[0],
        currentSortDirection
      );
    }
  }

  // Очищення контейнера
  container.innerHTML = "";

  if (students.length === 0) {
    container.innerHTML =
      '<p style="text-align: center; color: #95a5a6; padding: 40px;">Студентів не знайдено</p>';
  } else {
    // Відображення кожного студента
    students.forEach((student) => {
      const card = createStudentCard(student);
      container.appendChild(card);
    });
  }

  // Оновлення лічильника
  document.getElementById("studentCount").textContent = students.length;
}

/**
 * Функція створення картки студента
 */
function createStudentCard(student) {
  const card = document.createElement("div");
  card.className = "student-card";

  card.innerHTML = `
                <div class="student-header">
                    <div class="student-name">${student.lastName} ${
    student.firstName
  } ${student.middleName}</div>
                    <div class="student-actions">
                        <button class="action-btn edit-btn" onclick="editStudent(${
                          student.id
                        })">Редагувати</button>
                        <button class="action-btn delete-btn" onclick="deleteStudent(${
                          student.id
                        })">Видалити</button>
                    </div>
                </div>
                <div class="student-info">
                    <div class="info-item">
                        <span class="info-label">Телефон:</span> ${
                          student.phone
                        }
                    </div>
                    <div class="info-item">
                        <span class="info-label">Email:</span> ${student.email}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Дата народження:</span> ${
                          student.birthDate
                        }
                    </div>
                    <div class="info-item">
                        <span class="info-label">Група:</span> ${student.group}
                    </div>
                    <div class="info-item">
                        <span class="info-label">Місце проживання:</span> ${
                          student.address
                        }
                    </div>
                    <div class="info-item">
                        <span class="info-label">Форма навчання:</span> ${
                          student.educationType
                        }
                    </div>
                    <div class="info-item">
                        <span class="info-label">Середній бал:</span> ${
                          student.averageGrade
                        }
                    </div>
                    <div class="info-item">
                        <span class="info-label">Оцінки:</span> ${student.grades.join(
                          ", "
                        )}
                    </div>
                </div>
            `;

  return card;
}

/**
 * Функція видалення студента
 */
function deleteStudent(id) {
  if (confirm("Ви впевнені, що хочете видалити цього студента?")) {
    studentGroup.deleteStudent(id);
    displayStudents();
  }
}

/**
 * Функція редагування студента
 */
function editStudent(id) {
  editingStudentId = id;
  const student = studentGroup.students.find((s) => s.id === id);

  if (!student) return;

  // Заповнення форми редагування
  document.getElementById("editLastName").value = student.lastName;
  document.getElementById("editFirstName").value = student.firstName;
  document.getElementById("editMiddleName").value = student.middleName;
  document.getElementById("editPhone").value = student.phone;
  document.getElementById("editEmail").value = student.email;
  document.getElementById("editBirthDate").value = student.birthDate;
  document.getElementById("editGroup").value = student.group;
  document.getElementById("editAddress").value = student.address;
  document.getElementById("editEducationType").value = student.educationType;
  document.getElementById("editGrades").value = student.grades.join(" ");

  // Відкриття модального вікна
  document.getElementById("editModal").classList.add("active");
}

/**
 * Функція збереження відредагованого студента
 */
function saveEditedStudent() {
  clearError("editError");

  const lastName = document.getElementById("editLastName").value.trim();
  const firstName = document.getElementById("editFirstName").value.trim();
  const middleName = document.getElementById("editMiddleName").value.trim();
  const phone = document.getElementById("editPhone").value.trim();
  const email = document.getElementById("editEmail").value.trim();
  const birthDate = document.getElementById("editBirthDate").value;
  const group = document.getElementById("editGroup").value.trim();
  const address = document.getElementById("editAddress").value.trim();
  const educationType = document.getElementById("editEducationType").value;
  const gradesString = document.getElementById("editGrades").value.trim();

  // Валідація
  if (
    !lastName ||
    !firstName ||
    !middleName ||
    !phone ||
    !email ||
    !birthDate ||
    !group ||
    !address ||
    !educationType ||
    !gradesString
  ) {
    showError("editError", "Будь ласка, заповніть всі поля!");
    return;
  }

  if (!validateEmail(email)) {
    showError("editError", "Введіть коректну електронну пошту!");
    return;
  }

  if (!validatePhone(phone)) {
    showError("editError", "Введіть коректний номер телефону!");
    return;
  }

  // Перевірка унікальності email (виключаючи поточного студента)
  if (!studentGroup.isEmailUnique(email, editingStudentId)) {
    showError("editError", "Студент з такою електронною поштою вже існує!");
    return;
  }

  // Перевірка унікальності телефону (виключаючи поточного студента)
  if (!studentGroup.isPhoneUnique(phone, editingStudentId)) {
    showError("editError", "Студент з таким номером телефону вже існує!");
    return;
  }

  const gradesValidation = validateGrades(gradesString);
  if (!gradesValidation.valid) {
    showError("editError", gradesValidation.message);
    return;
  }

  // Оновлення студента
  const updatedData = {
    lastName,
    firstName,
    middleName,
    phone,
    email,
    birthDate,
    group,
    address,
    educationType,
    grades: gradesValidation.grades,
  };

  studentGroup.updateStudent(editingStudentId, updatedData);
  closeEditModal();
  displayStudents();
}

/**
 * Функція закриття модального вікна редагування
 */
function closeEditModal() {
  document.getElementById("editModal").classList.remove("active");
  editingStudentId = null;
  clearError("editError");
}

/**
 * Функція обробки кліків на кнопки сортування
 * Дозволяє обирати прізвище та ім'я одночасно
 */
document.getElementById("sortFieldButtons").addEventListener("click", (e) => {
  if (e.target.classList.contains("sort-btn")) {
    const field = e.target.dataset.field;

    // Якщо це прізвище або ім'я - дозволяємо множинний вибір
    if (field === "lastName" || field === "firstName") {
      if (selectedSortFields.includes(field)) {
        // Зняти вибір
        selectedSortFields = selectedSortFields.filter((f) => f !== field);
        e.target.classList.remove("active");
      } else {
        // Додати до вибору (але тільки для lastName та firstName)
        if (
          !selectedSortFields.includes("lastName") &&
          !selectedSortFields.includes("firstName")
        ) {
          selectedSortFields = [field];
        } else {
          selectedSortFields.push(field);
        }
        e.target.classList.add("active");
      }
    } else {
      // Для інших полів - одинарний вибір
      document
        .querySelectorAll("#sortFieldButtons .sort-btn")
        .forEach((btn) => {
          btn.classList.remove("active");
        });
      selectedSortFields = [field];
      e.target.classList.add("active");
    }
  }
});

document
  .getElementById("sortDirectionButtons")
  .addEventListener("click", (e) => {
    if (e.target.classList.contains("sort-btn")) {
      // Зняти активний клас з усіх кнопок в цій секції
      document
        .querySelectorAll("#sortDirectionButtons .sort-btn")
        .forEach((btn) => {
          btn.classList.remove("active");
        });

      // Додати активний клас до вибраної кнопки
      e.target.classList.add("active");
      currentSortDirection = e.target.dataset.direction;
    }
  });

/**
 * Функція застосування сортування
 */
function applySorting() {
  if (selectedSortFields.length === 0 || !currentSortDirection) {
    alert("Будь ласка, виберіть поле сортування та напрямок!");
    return;
  }

  displayStudents();
}

/**
 * Функція очищення сортування
 */
function clearSorting() {
  selectedSortFields = [];
  currentSortDirection = null;

  // Зняти активний клас з усіх кнопок сортування
  document.querySelectorAll(".sort-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  displayStudents();
}

/**
 * Функція оновлення кнопок сортування після автоматичного сортування
 */
function updateSortButtons() {
  document.querySelectorAll("#sortFieldButtons .sort-btn").forEach((btn) => {
    if (selectedSortFields.includes(btn.dataset.field)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  document
    .querySelectorAll("#sortDirectionButtons .sort-btn")
    .forEach((btn) => {
      if (btn.dataset.direction === currentSortDirection) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
}

/**
 * Функція пошуку студентів
 */
function searchStudents() {
  const searchValue = document.getElementById("searchInput").value.trim();

  if (!searchValue) {
    alert("Введіть текст для пошуку!");
    return;
  }

  currentSearchTerm = searchValue;
  displayStudents();
}

/**
 * Функція скидання пошуку
 */
function resetSearch() {
  currentSearchTerm = null;
  document.getElementById("searchInput").value = "";
  displayStudents();
}

/**
 * Функція для завантаження списку студентів у форматі .txt
 */
function downloadStudentsList() {
  let students = studentGroup.getAllStudents();

  // Застосування пошуку
  if (currentSearchTerm) {
    students = studentGroup.searchStudents(currentSearchTerm);
  }

  // Застосування сортування
  if (selectedSortFields.length > 0 && currentSortDirection) {
    // Якщо вибрано і прізвище, і ім'я - сортуємо одночасно
    if (
      selectedSortFields.includes("lastName") &&
      selectedSortFields.includes("firstName")
    ) {
      students = studentGroup.sortStudents(
        ["lastName", "firstName"],
        currentSortDirection
      );
    } else if (selectedSortFields.length === 1) {
      students = studentGroup.sortStudents(
        selectedSortFields[0],
        currentSortDirection
      );
    } else {
      // Інші комбінації - сортування за першим полем
      students = studentGroup.sortStudents(
        selectedSortFields[0],
        currentSortDirection
      );
    }
  }

  // Перевірка чи є студенти для завантаження
  if (students.length === 0) {
    alert("Немає студентів для завантаження!");
    return;
  }

  // Формування тексту файлу
  let fileContent = "";

  students.forEach((student, index) => {
    const studentNumber = index + 1;
    fileContent += `==========================${studentNumber}==========================\n`;
    fileContent += `ПІБ: ${student.lastName} ${student.firstName} ${student.middleName}\n`;
    fileContent += `Номер телефону: ${student.phone}\n`;
    fileContent += `Електрона пошта: ${student.email}\n`;
    fileContent += `Дата народження: ${student.birthDate}\n`;
    fileContent += `Група: ${student.group}\n`;
    fileContent += `Місце проживання: ${student.address}\n`;
    fileContent += `Форма навчання: ${student.educationType}\n`;
    fileContent += `Середньо статистична оцінка: ${student.averageGrade}\n`;
    fileContent += `Оцінки студента: ${student.grades.join(", ")}\n`;
    fileContent += `=====================================================\n\n`;
  });

  // Створення Blob об'єкту
  const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });

  // Створення посилання для завантаження
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);

  // Генерація назви файлу з поточною датою та часом
  const now = new Date();
  const dateStr = now.toLocaleDateString("uk-UA").replace(/\./g, "-");
  const timeStr = now
    .toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })
    .replace(/:/g, "-");
  link.download = `Список_студентів_${dateStr}_${timeStr}.txt`;

  // Симуляція кліку для завантаження
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Очищення URL об'єкту
  URL.revokeObjectURL(link.href);
}

// Початкове відображення студентів при завантаженні сторінки
displayStudents();

// Закриття модальних вікон при кліку поза ними
window.onclick = function (event) {
  const editModal = document.getElementById("editModal");

  if (event.target === editModal) {
    closeEditModal();
  }
};

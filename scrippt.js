document.addEventListener('DOMContentLoaded', function () {
  const table = document.getElementById('gradesTable');
  const averageHeader = document.getElementById('averageHeader');
  let averageType = 'percent';
  const gradeConversions = {
    percent: function(average) {
      return average + '%';
    },
    letter: function(average) {
      if (average >= 90) return 'A';
      else if (average >= 80) return 'B';
      else if (average >= 70) return 'C';
      else if (average >= 60) return 'D';
      else return 'F';
    },
    fourPoint: function(average) {
      if (average >= 90) return '4.0';
      else if (average >= 80) return '3.0';
      else if (average >= 70) return '2.0';
      else if (average >= 60) return '1.0';
      else return '0.0';
    }
  };
  let totalUnsubmitted = 0;
  let savedState = '';
  let selectedColumnIndex = -1;

  // Adding an input event listener to the table
  table.addEventListener('input', function (e) {
    const target = e.target;
    if (target.classList.contains('editable')) {
      validateCellData(target);
      updateAverage(target);
    }
  });

  // Toggle average type on header click
  averageHeader.addEventListener('click', function() {
    switchAverageType();
    updateAverageCells();
  });

  // Add new student button event listener
  const addStudentButton = document.getElementById('addStudentButton');
  addStudentButton.addEventListener('click', function() {
    addNewStudent();
  });

  // Add new assignment button event listener
  const addAssignmentButton = document.getElementById('addAssignmentButton');
  addAssignmentButton.addEventListener('click', function() {
    addNewAssignment();
  });

  // Save table state button event listener
  const saveButton = document.getElementById('saveButton');
  saveButton.addEventListener('click', function() {
    saveTableState();
  });

  // Restore table state button event listener
  const restoreButton = document.getElementById('restoreButton');
  restoreButton.addEventListener('click', function() {
    restoreTableState();
  });

  // Delete selected row button event listener
  const deleteRowButton = document.getElementById('deleteRowButton');
  deleteRowButton.addEventListener('click', function() {
    deleteSelectedRow();
  });

  // Delete selected column button event listener
  const deleteColumnButton = document.getElementById('deleteColumnButton');
  deleteColumnButton.addEventListener('click', function() {
    deleteSelectedColumn();
  });

  // Function to validate cell data
  function validateCellData(cell) {
    const value = parseInt(cell.innerText);
    if (isNaN(value) || value < 0 || value > 100) {
      cell.innerText = '-';
    }
  }

  // Function to update the average in the last column
  function updateAverage(target) {
    const row = target.parentElement;
    const cells = row.querySelectorAll('.editable');
    let sum = 0;
    let count = 0;

    // Loop through editable cells and calculate the sum
    cells.forEach(cell => {
      if (cell.innerText !== '-') {
        const value = parseInt(cell.innerText) || 0;
        if (!isNaN(value)) {
          sum += value;
          count++;
        }
      } else {
        totalUnsubmitted++;
        cell.style.backgroundColor = 'yellow'; // Change background color to yellow
      }
    });

    // Calculate and update the average in the last column
    const average = count > 0 ? Math.round(sum / count) : '';
    const averageCell = row.cells[row.cells.length - 1]; // Get the last cell
    averageCell.innerText = average !== '' ? gradeConversions[averageType](average) : '';

    // Apply styles only to the "Average (%)" cell
    applyGradeStyles(averageCell, average);
    updateAssignmentCount();
  }

  // Function to apply styling to grades below 60%
  function applyGradeStyles(averageCell, average) {
    if (average !== '' && average < 60) {
      averageCell.style.color = '#fff'; // White font color
      averageCell.style.backgroundColor = 'red'; // Red background color
    } else {
      averageCell.style.color = ''; // Reset font color
      averageCell.style.backgroundColor = ''; // Reset background color
    }
  }

  // Function to toggle average type
  function switchAverageType() {
    switch (averageType) {
      case 'percent':
        averageType = 'letter';
        averageHeader.textContent = 'Average [Letter]';
        break;
      case 'letter':
        averageType = 'fourPoint';
        averageHeader.textContent = 'Average [4.0]';
        break;
      case 'fourPoint':
        averageType = 'percent';
        averageHeader.textContent = 'Average [%]';
        break;
    }
  }

  // Function to update average cells with new type
  function updateAverageCells() {
    const averageCells = document.querySelectorAll('#gradesTable tbody td:last-child');
    averageCells.forEach(cell => {
      if (cell.innerText !== '') {
        const value = parseInt(cell.innerText);
        const row = cell.parentElement;
        const cells = row.querySelectorAll('.editable');
        let sum = 0;
        let count = 0;

        // Loop through editable cells and calculate the sum
        cells.forEach(cell => {
          if (cell.innerText !== '-') {
            const value = parseInt(cell.innerText) || 0;
            if (!isNaN(value)) {
              sum += value;
              count++;
            }
          }
        });

        // Calculate and update the average with new type
        const average = count > 0 ? Math.round(sum / count) : '';
        cell.innerText = average !== '' ? gradeConversions[averageType](average) : '';
      }
    });
  }

  // Function to update the total number of unsubmitted assignments
  function updateAssignmentCount() {
    const assignmentCountElement = document.getElementById('assignmentCount');
    assignmentCountElement.textContent = `Total Unsubmitted Assignments: ${totalUnsubmitted}`;
    if (totalUnsubmitted > 0) {
      assignmentCountElement.style.color = 'red';
    } else {
      assignmentCountElement.style.color = '';
    }
  }

  // Function to add a new student row
  function addNewStudent() {
    const tbody = document.querySelector('#gradesTable tbody');
    const studentName = prompt('Enter the name of the new student:');
    const studentID = prompt('Enter the ID of the new student:'); // Prompt for student ID as well if needed
    if (studentName) {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td class="left-align" contenteditable="false">${studentName}</td>
        <td class="left-align" contenteditable="false">${studentID || 'New ID'}</td>
        <td class="editable center-align" contenteditable="true">-</td>
        <td class="editable center-align" contenteditable="true">-</td>
        <td class="editable center-align" contenteditable="true">-</td>
        <td class="editable center-align" contenteditable="true">-</td>
        <td class="editable center-align" contenteditable="true">-</td>
        <td contenteditable="false"></td>
      `;
      tbody.appendChild(newRow);
    }
  }

  // Function to add a new assignment column
  function addNewAssignment() {
    const headerRow = document.querySelector('#gradesTable thead tr');
    const newTh = document.createElement('th');
    const newTitle = prompt('Enter title for new assignment:');
    if (newTitle) {
      newTh.className = 'center-align';
      newTh.textContent = newTitle;
      headerRow.insertBefore(newTh, averageHeader);
  
      // Add new cells for each student
      const rows = document.querySelectorAll('#gradesTable tbody tr');
      rows.forEach(row => {
        const newTd = document.createElement('td');
        newTd.className = 'editable center-align';
        newTd.contentEditable = true;
        newTd.textContent = '-';
        row.insertBefore(newTd, row.lastElementChild);
      });
    }
  }

  // Function to save the current table state
  function saveTableState() {
    savedState = table.innerHTML;
    alert('Table state saved!');
  }

  // Function to restore the table to the last saved state
  function restoreTableState() {
    if (savedState !== '') {
      table.innerHTML = savedState;
      totalUnsubmitted = 0; // Reset total unsubmitted count
      updateAverageCells(); // Update average cells based on restored data
      alert('Table state restored!');
    } else {
      alert('No saved state available!');
    }
  }

  // Function to delete selected row
  function deleteSelectedRow() {
    const selectedRow = document.querySelector('#gradesTable tbody tr.selected');
    if (selectedRow) {
      selectedRow.remove();
      updateTotalUnsubmitted();
      updateAverageCells();
      alert('Row deleted successfully!');
    } else {
      alert('Please select a row to delete!');
    }
  }

  // Function to delete selected column
  function deleteSelectedColumn() {
    const headerCells = document.querySelectorAll('#gradesTable thead th');
    headerCells.forEach((headerCell, index) => {
      headerCell.classList.remove('selected');
    });

    const selectedColumnIndex = prompt('Enter the index of the column to delete (starting from 1):');
    if (selectedColumnIndex) {
      const columnIndex = parseInt(selectedColumnIndex);
      if (!isNaN(columnIndex) && columnIndex > 0) {
        const headerCell = document.querySelector(`#gradesTable thead tr th:nth-child(${columnIndex})`);
        if (headerCell) {
          headerCell.remove();
          const rows = document.querySelectorAll('#gradesTable tbody tr');
          rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells[columnIndex - 1].remove();
          });
          updateAverageCells();
          alert('Column deleted successfully!');
        } else {
          alert('Invalid column index!');
        }
      } else {
        alert('Please enter a valid column index!');
      }
    }
  }

  // Function to update the total number of unsubmitted assignments after row deletion
  function updateTotalUnsubmitted() {
    const unsubmittedCells = document.querySelectorAll('#gradesTable tbody td');
    totalUnsubmitted = 0;
    unsubmittedCells.forEach(cell => {
      if (cell.innerText === '-') {
        totalUnsubmitted++;
      }
    });
    updateAssignmentCount();
  }

  // Function to handle column selection
  function handleColumnSelection(columnIndex) {
    const headerCells = document.querySelectorAll('#gradesTable thead th');
    headerCells.forEach((headerCell, index) => {
      if (index === columnIndex) {
        if (headerCell.classList.contains('selected')) {
          headerCell.classList.remove('selected');
          deselectColumn(columnIndex);
        } else {
          headerCell.classList.add('selected');
          selectColumn(columnIndex);
        }
      } else {
        headerCell.classList.remove('selected');
      }
    });
  }

  // Function to select a column
  function selectColumn(columnIndex) {
    const cells = document.querySelectorAll(`#gradesTable tbody tr td:nth-child(${columnIndex + 1})`);
    cells.forEach(cell => {
      cell.classList.add('selected');
    });
  }

  // Function to deselect a column
  function deselectColumn(columnIndex) {
    const cells = document.querySelectorAll(`#gradesTable tbody tr td:nth-child(${columnIndex + 1})`);
    cells.forEach(cell => {
      cell.classList.remove('selected');
    });
  }

  // Event listener for table header clicks
  table.addEventListener('click', function (e) {
    const target = e.target;
    if (target.tagName === 'TH' && !target.id.includes('averageHeader')) {
      const columnIndex = Array.from(target.parentElement.children).indexOf(target);
      if (selectedColumnIndex === columnIndex) {
        handleColumnSelection(columnIndex);
        selectedColumnIndex = -1;
      } else {
        selectedColumnIndex = columnIndex;
        handleColumnSelection(columnIndex);
      }
    }
  });
});

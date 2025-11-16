// Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark mode from localStorage
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateDarkModeIcon(currentTheme);

  // Dark mode toggle button
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateDarkModeIcon(newTheme);
    });
  }

  function updateDarkModeIcon(theme) {
    const icon = document.getElementById('darkModeIcon');
    if (icon) {
      if (theme === 'dark') {
        icon.classList.remove('bi-moon-stars');
        icon.classList.add('bi-sun');
      } else {
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon-stars');
      }
    }
  }
});

// Toast Notification Function
function showToast(title, message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');

  const toastId = 'toast-' + Date.now();
  const bgClass = type === 'success' ? 'bg-success' :
                  type === 'error' ? 'bg-danger' :
                  type === 'warning' ? 'bg-warning' : 'bg-info';

  const toastHTML = `
    <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header ${bgClass} text-white">
        <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        <strong class="me-auto">${title}</strong>
        <small class="text-white-50">Just now</small>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        ${message}
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHTML);

  const toastElement = document.getElementById(toastId);
  const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 5000 });
  toast.show();

  // Remove toast from DOM after it's hidden
  toastElement.addEventListener('hidden.bs.toast', function() {
    toastElement.remove();
  });
}

// Make showToast available globally
window.showToast = showToast;

// Copy to Clipboard Function
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(function() {
    showToast('Success', successMessage, 'success');
  }, function(err) {
    showToast('Error', 'Failed to copy text', 'error');
  });
}

window.copyToClipboard = copyToClipboard;

// Auto-dismiss alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
  alerts.forEach(alert => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
});

// Confirm delete function
function confirmDelete(message = 'Are you sure you want to delete this item?') {
  return confirm(message);
}

window.confirmDelete = confirmDelete;

// DataTable default configuration
if (typeof $.fn.dataTable !== 'undefined') {
  $.extend(true, $.fn.dataTable.defaults, {
    language: {
      search: "",
      searchPlaceholder: "Search...",
      lengthMenu: "_MENU_ records per page",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "No entries available",
      infoFiltered: "(filtered from _MAX_ total entries)",
      zeroRecords: "No matching records found",
      emptyTable: "No data available in table"
    },
    pageLength: 25,
    responsive: true
  });
}

// Form validation
(function() {
  'use strict';

  // Fetch all forms with needs-validation class
  var forms = document.querySelectorAll('.needs-validation');

  // Loop over them and prevent submission if invalid
  Array.prototype.slice.call(forms).forEach(function(form) {
    form.addEventListener('submit', function(event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    }, false);
  });
})();

// Auto-format phone numbers
document.addEventListener('DOMContentLoaded', function() {
  const phoneInputs = document.querySelectorAll('input[type="tel"], input[name="phone"]');
  phoneInputs.forEach(input => {
    input.addEventListener('blur', function() {
      // Simple phone number formatting (US format)
      let value = this.value.replace(/\D/g, '');
      if (value.length === 10) {
        this.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      }
    });
  });
});

// License key formatter (make it easier to read)
document.addEventListener('DOMContentLoaded', function() {
  const licenseInputs = document.querySelectorAll('input[name="license_key"]');
  licenseInputs.forEach(input => {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      let formatted = '';

      for (let i = 0; i < value.length && i < 16; i++) {
        if (i > 0 && i % 4 === 0) {
          formatted += '-';
        }
        formatted += value[i];
      }

      e.target.value = formatted;
    });
  });
});

// Enable tooltips everywhere
document.addEventListener('DOMContentLoaded', function() {
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

// Enable popovers everywhere
document.addEventListener('DOMContentLoaded', function() {
  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function(popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
});

// Print functionality
function printPage() {
  window.print();
}

window.printPage = printPage;

// Export table to CSV
function exportTableToCSV(tableId, filename = 'export.csv') {
  const table = document.getElementById(tableId);
  if (!table) return;

  let csv = [];
  const rows = table.querySelectorAll('tr');

  for (let i = 0; i < rows.length; i++) {
    const row = [], cols = rows[i].querySelectorAll('td, th');

    for (let j = 0; j < cols.length - 1; j++) { // Skip last column (actions)
      row.push('"' + cols[j].innerText.replace(/"/g, '""') + '"');
    }

    csv.push(row.join(','));
  }

  // Download CSV file
  const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = 'none';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  showToast('Success', 'Table exported to CSV', 'success');
}

window.exportTableToCSV = exportTableToCSV;

// Loading overlay
function showLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
      <div class="spinner-border text-light" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

window.showLoading = showLoading;
window.hideLoading = hideLoading;

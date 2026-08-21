// API Client Scripts

function openDeleteModal(featureId, featureTitle) {
    const modalElement = document.getElementById("deleteConfirmModal");
    if (!modalElement) return;

    const titleSpan = document.getElementById("deleteFeatureTitle");
    if (titleSpan) {
        titleSpan.textContent = `"${featureTitle}" (#${featureId})`;
    }

    const form = document.getElementById("deleteFeatureForm");
    if (form) {
        form.action = `/features/${featureId}/delete`;
    }

    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();
}

"use client";
import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';

// Optional: for JSX support if you want to render React components in alerts
// const MySwal = withReactContent(Swal);

export const showAlert = async ({
    title,
    severity,
    text,
    handleConfirmButtonClick,
    allowOutsideClick = false,
}: {
    title: string;
    severity: 'success' | 'error' | 'warning';
    text?: string;
    handleConfirmButtonClick?: () => void;
    allowOutsideClick?: boolean;
}) => {


    const color =
        severity === 'success'
            ? '#3085d6'
            : severity === 'error'
                ? '#d33'
                : '#f0ad4e';

    Swal.fire({
        icon: severity,
        title,
        text,
        confirmButtonColor: color,
        confirmButtonText: 'CLOSE',
        allowOutsideClick,
    }).then((result) => {
        if (result.isConfirmed && handleConfirmButtonClick) {
            handleConfirmButtonClick();
        }
    });

};
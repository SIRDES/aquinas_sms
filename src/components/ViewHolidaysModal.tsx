import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from '@mui/material';

interface ViewHolidaysModalProps {
  open: boolean;
  onClose: () => void;
  fetchedHolidays: any[];
}

const ViewHolidaysModal: React.FC<ViewHolidaysModalProps> = ({ open, onClose, fetchedHolidays }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, color: "#00204a" }}>Attendance Holidays</DialogTitle>
      <DialogContent dividers>
        {fetchedHolidays && fetchedHolidays.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetchedHolidays.map((holiday: any) => (
                <TableRow key={holiday._id}>
                  <TableCell>{new Date(holiday.date).toDateString()}</TableCell>
                  <TableCell>{holiday.description}</TableCell>
                  <TableCell>
                    {holiday.duration === "morning"
                      ? "Morning Only"
                      : holiday.duration === "afternoon"
                      ? "Afternoon Only"
                      : "Full Day"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">No holidays recorded.</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewHolidaysModal;

import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";

export const CustomizedSelect = styled(InputBase)(({ theme }) => ({
  "label + &": {
    marginTop: theme.spacing(3),
  },
  "& .MuiInputBase-input": {
    border: "2px solid #ABB3BF",
    padding: "9px",
    // paddingTop: "17px",
    borderRadius: "5px",
    // transition: theme.transitions.create(['border-color', 'box-shadow']),
    "&:focus": {
      borderRadius: "5px",
      // borderColor: '#80bdff',
      // boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}));

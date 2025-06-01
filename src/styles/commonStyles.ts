export const commonStyles = {
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: { xs: '6px', sm: '8px' },
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: { xs: '38px', sm: '42px' },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(82, 168, 236, 0.6)',
        boxShadow: '0 0 20px rgba(82, 168, 236, 0.15)',
      },
      '&.MuiInputBase-multiline': {
        height: 'auto',
        padding: { xs: '8px', sm: '12px' },
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
      transform: { 
        xs: 'translate(12px, 10px)',
        sm: 'translate(14px, 12px)'
      },
      transition: 'all 0.2s ease',
      '&.MuiInputLabel-shrink': {
        transform: { 
          xs: 'translate(12px, -8px) scale(0.75)',
          sm: 'translate(14px, -9px) scale(0.75)'
        },
        color: '#52a8ec',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52a8ec',
      textShadow: '0 0 8px rgba(82, 168, 236, 0.4)',
    },
    '& input': {
      color: '#fff',
      padding: { xs: '10px 12px', sm: '12px 14px' },
      height: { xs: '16px', sm: '18px' },
      boxSizing: 'border-box',
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
      '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus, &:-webkit-autofill:active': {
        transition: 'background-color 5000s ease-in-out 0s',
        WebkitTextFillColor: '#fff !important',
        WebkitBoxShadow: '0 0 0 1000px rgba(255, 255, 255, 0.07) inset !important',
        borderRadius: { xs: '6px', sm: '8px' },
      },
    },
    '& textarea': {
      color: '#fff',
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
    },
  },
  select: {
    '& .MuiOutlinedInput-root': {
      borderRadius: { xs: '6px', sm: '8px' },
      transition: 'all 0.3s ease',
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      backdropFilter: 'blur(8px)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: { xs: '38px', sm: '42px' },
      display: 'flex',
      alignItems: 'center',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)',
      },
      '&.Mui-focused': {
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(82, 168, 236, 0.6)',
        boxShadow: '0 0 20px rgba(82, 168, 236, 0.15)',
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
      transform: { 
        xs: 'translate(12px, 10px)',
        sm: 'translate(14px, 12px)'
      },
      transition: 'all 0.2s ease',
      '&.MuiInputLabel-shrink': {
        transform: { 
          xs: 'translate(12px, -8px) scale(0.75)',
          sm: 'translate(14px, -9px) scale(0.75)'
        },
        color: '#52a8ec',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#52a8ec',
      textShadow: '0 0 8px rgba(82, 168, 236, 0.4)',
    },
    '& .MuiSelect-select': {
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
      padding: { xs: '8px 12px', sm: '10px 14px' },
    },
  },
  datePicker: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      height: { xs: '38px', sm: '42px' },
    },
    '& .MuiOutlinedInput-input': {
      padding: { xs: '10px 12px', sm: '12px 14px' },
      height: { xs: '16px', sm: '18px' },
      boxSizing: 'border-box',
      fontSize: { xs: '0.813rem', sm: '0.875rem' },
    },
  },
  card: {
    borderRadius: { xs: '12px', sm: '16px' },
    background: 'linear-gradient(145deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 100%)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '1px solid rgba(82, 168, 236, 0.3)',
      boxShadow: '0 8px 32px rgba(82, 168, 236, 0.1)',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.07) 100%)',
    },
  },
  sectionTitle: {
    position: 'relative',
    '&:after': {
      content: '""',
      position: 'absolute',
      bottom: '-4px',
      left: '0',
      width: { xs: '30px', sm: '40px' },
      height: '2px',
      background: 'linear-gradient(90deg, #52a8ec 0%, rgba(82, 168, 236, 0.2) 100%)',
    },
  },
}; 
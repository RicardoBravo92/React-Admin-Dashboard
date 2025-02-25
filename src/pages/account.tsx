import { useAuth } from '@workos-inc/authkit-react';
import { Box, Grid, Typography, TextField } from '@mui/material';
import { useUser } from '@/hooks/use-user';

export default function Account() {
  const user = useUser();
  const { role, organizationId } = useAuth();

  if (!user) {
    return '...';
  }

  const userFields = [
    ['First name', user.firstName],
    ['Last name', user.lastName],
    ['Email', user.email],
    role ? ['Role', role] : [],
    ['Id', user.id],
    organizationId ? ['Organization Id', organizationId] : [],
  ].filter((arr) => arr.length > 0);

  return (
    <>
      <Grid container direction="column" spacing={2} mb={7}>
        <Grid item>
          <Typography variant="h4" align="center">
            Account details
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1" align="center" color="textSecondary">
            Below are your account details
          </Typography>
        </Grid>
      </Grid>

      {userFields && (
        <Grid container direction="column" spacing={3} maxWidth={400} mx="auto">
          {userFields.map(([label, value]) => (
            <Grid item key={value}>
              <Box display="flex" alignItems="center" gap={3}>
                <Typography fontWeight="bold" style={{ width: 100 }}>
                  {label}
                </Typography>
                <Box flexGrow={1}>
                  <TextField
                    value={value || ''}
                    InputProps={{
                      readOnly: true,
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}

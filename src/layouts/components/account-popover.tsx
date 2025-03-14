import type { IconButtonProps } from '@mui/material/IconButton';
import { useState, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { useRouter, usePathname } from 'src/routes/hooks';
import { _myAccount } from 'src/_mock';
import { useAuth } from '@workos-inc/authkit-react';
import { useUser } from '../../hooks/use-user';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const router = useRouter();
  const user = useUser();
  const { signOut } = useAuth();
  const pathname = usePathname();

  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleClickItem = useCallback(
    (path: string) => {
      handleClosePopover();
      router.push(path);
    },
    [handleClosePopover, router]
  );

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      handleClosePopover();
      router.push('/'); // Redirect to home or login page after sign-out
    } catch (error) {
      console.error('Error during sign-out:', error);
    }
  }, [signOut, handleClosePopover, router]);

  const displayName = useMemo(
    () => (user ? `${user.firstName} ${user.lastName}` : _myAccount.displayName),
    [user]
  );

  const email = useMemo(() => user?.email || _myAccount.email, [user]);

  const avatarInitial = useMemo(
    () =>
      user?.firstName?.charAt(0).toUpperCase() || _myAccount.displayName.charAt(0).toUpperCase(),
    [user]
  );

  return (
    <>
      <IconButton
        onClick={handleOpenPopover}
        sx={{
          p: '2px',
          width: 40,
          height: 40,
          background: (theme) =>
            `conic-gradient(${theme.palette.primary.light}, ${theme.palette.warning.light}, ${theme.palette.primary.light})`,
          ...sx,
        }}
        aria-label="Account menu"
        {...other}
      >
        <Avatar src={_myAccount.photoURL} alt={displayName} sx={{ width: 1, height: 1 }}>
          {avatarInitial}
        </Avatar>
      </IconButton>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { width: 200 },
          },
        }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {displayName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {data.length > 0 && (
          <MenuList
            disablePadding
            sx={{
              p: 1,
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
              [`& .${menuItemClasses.root}`]: {
                px: 1,
                gap: 2,
                borderRadius: 0.75,
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
                [`&.${menuItemClasses.selected}`]: {
                  color: 'text.primary',
                  bgcolor: 'action.selected',
                  fontWeight: 'fontWeightSemiBold',
                },
              },
            }}
          >
            {data.map((option) => (
              <MenuItem
                key={option.label}
                selected={option.href === pathname}
                onClick={() => handleClickItem(option.href)}
              >
                {option.icon}
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        )}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {user && (
          <Box sx={{ p: 1 }}>
            <Button fullWidth color="error" size="medium" variant="text" onClick={handleSignOut}>
              Logout
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
}

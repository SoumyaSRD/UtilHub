import React, { useState } from 'react';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useAppDispatch } from '@app/store';
import { showToast } from '@app/store/slices/uiSlice';

export interface AppCopyButtonProps extends Omit<IconButtonProps, 'onClick'> {
  textToCopy: string;
  tooltipText?: string;
  successMessage?: string;
}

export const AppCopyButton: React.FC<AppCopyButtonProps> = ({
  textToCopy,
  tooltipText = 'Copy to clipboard',
  successMessage = 'Copied to clipboard!',
  size = 'small',
  sx,
  ...props
}) => {
  const dispatch = useAppDispatch();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      dispatch(showToast({ message: successMessage, severity: 'success' }));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      dispatch(showToast({ message: 'Failed to copy to clipboard', severity: 'error' }));
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : tooltipText}>
      <IconButton
        size={size}
        onClick={handleCopy}
        sx={{
          color: copied ? 'var(--color-success)' : 'var(--color-text-secondary)',
          '&:hover': {
            backgroundColor: 'var(--color-surface-hover)',
          },
          ...sx,
        }}
        {...props}
      >
        {copied ? <CheckIcon fontSize={size} /> : <ContentCopyIcon fontSize={size} />}
      </IconButton>
    </Tooltip>
  );
};

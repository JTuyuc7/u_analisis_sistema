'use client'

import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
  Snackbar
} from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { formatCardNumber, formatCurrency } from "@/lib/utils/utils";
import { getCardByAccountNumber } from "@/app/actions";
import { IAccountDataProps } from "@/lib/interfaces";
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RenderContent from "../common/renderContent";

interface CardDetails {
  card_number: string;
  expiration_date: string;
  status: string;
  cvv: string;
}

interface CheckBalanceMainContentProps {
  onHandleCancelView: () => void
}


export default function CheckBalanceMainContent({ onHandleCancelView }: CheckBalanceMainContentProps) {
  const accounts = useSelector((state: RootState) => state.account.accounts);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<IAccountDataProps | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCopyAccountNumber = () => {
    if (currentAccount) {
      navigator.clipboard.writeText(currentAccount.account_number)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy account number: ', err);
        });
    }
  };

  const handleAccountChange = async (event: SelectChangeEvent) => {
    const accountNumber = event.target.value;
    setSelectedAccount(accountNumber);
    setLoading(true);
    setError(null);

    // Find the selected account from the accounts list
    const account = accounts.find(acc => acc.account_number === accountNumber);
    if (account) {
      setCurrentAccount(account);
    }

    try {
      const response = await getCardByAccountNumber(accountNumber);
      if (response.success && response.data.card) {
        setCardDetails(response.data.card);
      } else {
        setError(response.data.msg || "Failed to fetch card details");
        setCardDetails(null);
      }
    } catch (error: unknown) {
      console.error('Error fetching card details:', error);
      setError("An error occurred while fetching card details");
      setCardDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (accounts.length === 0) {
    return (
      <RenderContent title="">
        <Typography variant="h6" gutterBottom color="primary.main">
          No accounts available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please create an account to check your balance.
        </Typography>
      </RenderContent>
    )
  }

  return (
    <Box sx={{ maxWidth: 'sm', width: '100%' }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="primary.main">
          Select Account
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="account-select-label">Account</InputLabel>
          <Select
            labelId="account-select-label"
            id="account-select"
            value={selectedAccount}
            label="Account"
            onChange={handleAccountChange}
            displayEmpty
            renderValue={(selected) => {
              const account = accounts.find(acc => acc.account_number === selected);
              return account ? `${account.account_name} (${account.account_type}) - ${account.account_number}` : "";
            }}
          >
            {accounts.map((account) => (
              <MenuItem key={account.account_id} value={account.account_number}>
                <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">
                      {account.account_name} ({account.account_type})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Account #: {account.account_number}
                    </Typography>
                  </Box>
                  <Typography
                    variant="subtitle1"
                    color="primary"
                    sx={{ fontWeight: 'bold', ml: 2 }}
                  >
                    {formatCurrency(account.balance)}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {currentAccount && !loading && (
          <Paper elevation={3} sx={{ mb: 3, p: 2, bgcolor: 'background.default' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Account Details</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Account Name</Typography>
                <Typography variant="body1">{currentAccount.account_name}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Account Type</Typography>
                <Typography variant="body1">{currentAccount.account_type}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">{currentAccount.account_number}</Typography>
                  <Tooltip title="Copy account number">
                    <IconButton 
                      size="small" 
                      onClick={handleCopyAccountNumber}
                      sx={{ ml: 1 }}
                    >
                      <ContentCopyIcon fontSize="small" color="primary" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <Typography variant="body1" sx={{
                  color: currentAccount.status === 'active' ? 'success.main' : 'error.main'
                }}>
                  {currentAccount.status.charAt(0).toUpperCase() + currentAccount.status.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Current Balance</Typography>
                <Typography variant="h5" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(currentAccount.balance)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}

        {cardDetails && !loading && (
          <Card sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            position: 'relative',
            overflow: 'visible',
            boxShadow: 3
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Card Associated</Typography>
                <CreditCardIcon />
              </Box>

              <Typography variant="body1" sx={{ mb: 2, letterSpacing: 2, fontSize: '1.2rem' }}>
                {formatCardNumber(cardDetails.card_number)}
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    VALID THRU
                  </Typography>
                  <Typography variant="body2">
                    {cardDetails.expiration_date}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption">
                    CVV
                    <Typography variant="body2">
                      {cardDetails.cvv}
                    </Typography>
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    STATUS
                  </Typography>
                  <Typography variant="body2">
                    {cardDetails.status.toUpperCase()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>
      <Button
        onClick={onHandleCancelView}
      >
        <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline' }}>
          Back to Transactions
        </Typography>
      </Button>
      
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="Account number copied to clipboard"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}

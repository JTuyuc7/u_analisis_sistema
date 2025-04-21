import { Box, FormControl, FormHelperText, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, Typography } from "@mui/material";
import { formatCurrency } from "@/lib/utils/utils";
import { IAccountDataProps, TransferFormData } from "@/lib/interfaces";
import { ITransferFormState } from "@/app/actions/transferAction";

interface IRenderPageProps {
  accounts: IAccountDataProps[]
  errors: ITransferFormState["errors"]
  formData: TransferFormData
  handleFromAccountChange: (account_id: string, account_number: string, availableAmount: string) => void
  title: string
}

export default function RenderAccountList({ accounts, errors, formData, handleFromAccountChange, title }: IRenderPageProps) {
  const handleAccountChange = (e: SelectChangeEvent<string>) => {
    const findAccount = accounts.find(account => account.account_number === e.target.value);
    if (findAccount) {
      handleFromAccountChange(findAccount.account_id.toString(), findAccount.account_number, findAccount.balance.toString());
    }
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <FormControl fullWidth error={!!errors?.fromAccountId} required>
        <InputLabel id="from-account-label">Account</InputLabel>
        <Select
          labelId="from-account-label"
          id="fromAccountId"
          name="fromAccountId"
          value={formData.account.account_number || ""}
          label="From Account"
          required
          onChange={handleAccountChange}
          renderValue={(selected) => {
            const account = accounts.find(acc => acc.account_number === selected);
            return account ? `${account.account_name} (${account.account_type}) - ${formatCurrency(account.balance)} - ${account.account_number}` : "";
          }}
        >
          {accounts.map((account: IAccountDataProps) => (
            <MenuItem
              key={account.account_id}
              value={account.account_number}
              disabled={account.balance <= 0}
              sx={{
                opacity: account.balance <= 0 ? 0.6 : 1
              }}
            >
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
                  color={account.balance <= 0 ? "text.disabled" : "primary"}
                  sx={{ fontWeight: 'bold', ml: 2 }}
                >
                  {formatCurrency(account.balance)}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        {errors?.fromAccountId && (
          <FormHelperText>{errors.fromAccountId}</FormHelperText>
        )}
      </FormControl>
    </Paper>
  )
}
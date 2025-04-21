'use client'
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Typography,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  Card,
  CardContent,
  IconButton
} from "@mui/material";
import RenderContent from "../common/renderContent";
import { TransactionList, TransactionType } from "@/lib/interfaces";
import { formatCurrency, formatDate } from "@/lib/utils/utils";
import { Close } from "@mui/icons-material";
interface ITransactionsMainPageProps {
  transactions: TransactionList[]
}

export default function TransactionsMainPage({ transactions }: ITransactionsMainPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathName = usePathname();

  // Initialize state from URL query parameters
  const initialPage = parseInt(searchParams.get('page') || '0');
  const initialRowsPerPage = parseInt(searchParams.get('limit') || '10');
  const initialTypeFilter = searchParams.get('type') || 'all';
  const initialSearchQuery = searchParams.get('search') || '';

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string>(initialTypeFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [skipUrlUpdate, setSkipUrlUpdate] = useState<boolean>(false);

  // Update URL when filters change
  useEffect(() => {
    if (skipUrlUpdate) {
      setSkipUrlUpdate(false); // reset flag after skipping
      return;
    }

    const params = new URLSearchParams();
    if (page > 0) params.set('page', page.toString());
    if (rowsPerPage !== 10) params.set('limit', rowsPerPage.toString());
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (searchQuery) params.set('search', searchQuery);

    const queryString = params.toString();
    const url = queryString ? `?${queryString}` : '';
    router.replace(url, { scroll: false });
  }, [page, rowsPerPage, typeFilter, searchQuery, skipUrlUpdate, router]);

  // Handle pagination changes
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Filter by transaction type
      if (typeFilter !== 'all' && transaction.transaction_type !== typeFilter) {
        return false;
      }

      // Search by description, amount, account number, or customer name
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const descriptionMatch = transaction.description?.toLowerCase().includes(searchLower);
        const amountMatch = transaction.amount.toLowerCase().includes(searchLower);
        const accountMatch = transaction.account.account_number.toLowerCase().includes(searchLower);
        const customerMatch = `${transaction.customer.first_name} ${transaction.customer.last_name}`.toLowerCase().includes(searchLower);

        return descriptionMatch || amountMatch || accountMatch || customerMatch;
      }

      return true;
    });
  }, [transactions, typeFilter, searchQuery]);

  // Get current page transactions
  const currentTransactions = useMemo(() => {
    return filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredTransactions, page, rowsPerPage]);

  
  // Get transaction type chip color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case TransactionType.Deposit:
        return 'success';
      case TransactionType.Transfer:
        return 'primary';
      default:
        return 'default';
    }
  };

  const handleResetFilters = (clearType: string) => {
    setSkipUrlUpdate(true);

    if (clearType === 'search') { 
      setSearchQuery('');
    } else {
      setTypeFilter('all');
    }

    const newUrl = pathName; 
    const params = new URLSearchParams(window.location.search);
    params.delete(clearType);
    const queryParams = params.toString();
    const newUrlParamsString = queryParams.toString() ? `?${queryParams}` : '';
    const newUrlWithParams = `${newUrl}${newUrlParamsString}`;
    window.history.pushState({}, '', newUrlWithParams);
  };

  if (transactions.length === 0) { 
    return (
      <RenderContent title="Transactions" titleColor="primary.main">
        <Card sx={{ width: '100%', maxWidth: 1200, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" color="textSecondary" align="center">
              No transactions yet.
            </Typography>
          </CardContent>
        </Card>
      </RenderContent>
    );
  }

  return (
    <RenderContent title="Transactions" titleColor="primary.main">
      <Card sx={{ width: '100%', maxWidth: 1200, mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search transactions"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0); // Reset to first page when searching
                }}
                placeholder="Search by description, amount, account, customer..."
                size="small"
                InputProps={{
                  endAdornment: (
                    <>
                      {
                        searchQuery.length > 0 && (
                          <>
                            <Box sx={{ display: 'flex', alignContent: 'center' }}>
                              <Typography variant="caption" color="textSecondary" sx={{ mr: 0.5 }}>
                                {filteredTransactions.length}
                              </Typography>
                              <Typography variant="caption" sx={{ mr: 1 }}> Results</Typography>
                            </Box>
                            <Box>
                              <IconButton
                                onClick={() => handleResetFilters('search')}
                              >
                                <Close color="error" />
                              </IconButton>
                            </Box>
                          </>
                        )
                      }
                    </>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="transaction-type-label">Transaction Type</InputLabel>
                <Select
                  labelId="transaction-type-label"
                  value={typeFilter}
                  label="Transaction Type"
                  onChange={(e) => {
                    setTypeFilter(e.target.value as string);
                    setPage(0); // Reset to first page when changing filter
                  }}
                  //* TODO: find if this is useful to keep it
                  endAdornment={
                    typeFilter !== 'all' ? (
                      <IconButton 
                        size="small" 
                        sx={{ mr: 2 }}
                        onClick={ () => handleResetFilters('type') }
                      >
                        <Close fontSize="small" color="error" />
                      </IconButton>
                    ) : null
                  }
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value={TransactionType.Deposit}>Deposit</MenuItem>
                  <MenuItem value={TransactionType.Transfer}>Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Showing {filteredTransactions.length} transactions
          </Typography>

          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="transactions table">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Customer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentTransactions.length > 0 ? (
                  currentTransactions.map((transaction) => (
                    <TableRow key={transaction.transaction_id}>
                      <TableCell>{transaction.transaction_id}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.transaction_type}
                          color={getTransactionTypeColor(transaction.transaction_type) as "success" | "primary" | "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{
                        color: transaction.transaction_type === TransactionType.Deposit
                          ? 'success.main'
                          : transaction.transaction_type === TransactionType.Transfer
                            ? 'error.main'
                            : 'inherit'
                      }}>
                        {formatCurrency(parseFloat(transaction.amount))}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.account.account_number}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {transaction.account.account_type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {transaction.customer.first_name} {transaction.customer.last_name}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </RenderContent>
  );
}

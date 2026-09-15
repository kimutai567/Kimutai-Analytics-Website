# Kimutai Analytics

Boom and Crash spike detection dashboard for Deriv synthetic indices.

## Product Workflow

```text
User opens Kimutai Analytics
        |
        v
Login or sign up
        |
        v
Dashboard loads the user's workspace
        |
        v
Connect to Deriv WebSocket
        |
        v
Receive live tick data
        |
        v
Calculate EMA, RSI, and spike conditions
        |
        v
Display signals and alerts
        |
        v
Save trades and signal history
```

## Supported Markets

- Boom 500 Index
- Boom 300 Index
- Crash 500 Index
- Crash 300 Index

## Current Frontend Features

- Kimutai Analytics dashboard branding
- Responsive trading-style dashboard layout
- Market watchlist for Boom and Crash indexes
- Login and sign-up modal interface
- Welcome message after submitting the demo form
- Deriv WebSocket connection button
- Live, connecting, error, and offline feed states
- Boom 500 tick subscription prototype
- Market scan button and notification message
- Boom and Crash watchlist filters
- Recent signals table
- Signal rule display for spike detection, EMA, and RSI
- Save all the succesfull entries

## Deriv WebSocket Workflow

The current browser prototype connects to the Deriv WebSocket when the user clicks **Connect feed**.

```text
Click Connect feed
        |
        v
Open Deriv WebSocket
        |
        v
Subscribe to Boom 500 ticks
        |
        v
Receive tick messages
        |
        v
Log tick data in the browser console
```

The current connection is a learning prototype. The received ticks are not yet displayed in the market cards and are not yet used for EMA, RSI, or spike calculations.

## Planned Detection Workflow

```text
Live Deriv ticks
        |
        v
Store recent price candles
        |
        v
Calculate EMA 9 and EMA 21
        |
        v
Calculate RSI
        |
        v
Check Boom or Crash spike rules
        |
        v
Create a signal
        |
        v
Show dashboard alert and optional sound notification
        |
        v
Save the signal and trade result
```

## Planned Application Architecture

```text
Deriv WebSocket API
        |
        v
Signal Engine / Analytics
(Node.js or Python)
        |
        +--------------------+
        |                    |
        v                    v
Redis cache / data bus   PostgreSQL database
        |                    |
        +----------+---------+
                   v
          Real-time WebSocket server
                   |
                   v
             Frontend dashboard
```

The backend should perform the important calculations and keep the Deriv credentials, database credentials, and business rules away from the browser.

## Login and Account Workflow

The current login and sign-up form is only a frontend demonstration.

```text
User clicks Log in or Sign up
        |
        v
Form opens in a modal
        |
        v
User enters email and password
        |
        v
Demo welcome message appears
```

The production workflow will be:

```text
Frontend form
        |
        v
Authentication API
        |
        v
Validate user credentials
        |
        v
Create session or access token
        |
        v
Load private dashboard workspace
```

## Subscription and M-Pesa Workflow

Subscription payments must be handled by the backend. API keys and payment verification must never be placed in frontend JavaScript.

```text
User clicks Subscribe
        |
        v
Select plan and enter phone number
        |
        v
Backend creates payment request
        |
        v
Safaricom Daraja API or a gateway supporting M-Pesa
        |
        v
M-Pesa STK prompt appears on user's phone
        |
        v
User enters M-Pesa PIN
        |
        v
Payment provider sends webhook to backend
        |
        v
Backend verifies payment and updates database
        |
        v
Subscription access is granted
        |
        v
Dashboard is unlocked
```

For Kenyan M-Pesa, use either the Safaricom Daraja API directly or one payment gateway that explicitly supports M-Pesa. Paystack and Flutterwave should not both be added unless there is a clear reason to support both.

## Database

The planned `trades` table stores trade results:

```sql
CREATE TABLE trades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trade_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    index_name ENUM('Boom 500', 'Boom 300', 'Crash 500', 'Crash 300') NOT NULL,
    ema_alignment ENUM('Valid', 'Invalid') NOT NULL,
    rsi_level DECIMAL(5,2) NOT NULL,
    exit_type ENUM('Spike Hit', '5-Candle Cut', 'Hard Stop') NOT NULL,
    pnl_amount DECIMAL(6,2) NOT NULL,
    notes TEXT NULL
);
```

The application may use PostgreSQL in the final architecture, so this MySQL-style table will need an adaptation if PostgreSQL is selected.

## Files

- `index.html` - Dashboard markup and current demo interactions
- `style.css` - Responsive dashboard styling and theme variables
- `README.md` - Project workflows, architecture, and progress notes

## Next Development Steps

1. Display live Deriv tick prices in the four market cards.
2. Subscribe to all four Boom and Crash symbols.
3. Build candle storage and EMA/RSI calculations.
4. Define and test the spike detection rules.
5. Add the real authentication API and database users table.
6. Add subscription plans and backend payment integration.
7. Save signals, trades, and payment status in the database.
8. Identify weak and strong spikes across the markets .
9. Have analysis over 4 days of spikes to have a proper risk management.


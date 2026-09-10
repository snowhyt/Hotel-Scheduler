# Hotel-Scheduler

# Postman Json for checking api
# booking
   {
        "id": 11,
        "room_id": 1,
        "guest_name": "oliver",
        "guest_email": "oliver@email.com",
        "check_in": "2026-03-19T16:00:00.000Z",
        "check_out": "2026-03-21T16:00:00.000Z",
        "created_at": "2026-03-19T03:52:11.574Z",
        "guest_phonenumber": "09123456789",
        "status": "pending"
    }

# rooms
    {
        "room_number" : 204,
        "room_type" : "Superior rooms",
        "price" : 1500
    }

# Build the project
    docker compose up --build
    docker compose up -b
    docker compose down
    docker compose down -v
    docker prune -v

  # Database Schema
 erDiagram
    USERS }|--o{ BOOKINGS : "creates"
    USERS }|--o{ ROOM_MAINTENANCE : "logs"
    
    GUESTS ||--o{ BOOKING_GUESTS : "occupies"
    BOOKINGS ||--o{ BOOKING_GUESTS : "has companions"
    
    ROOMS ||--o{ BOOKINGS : "assigns"
    ROOMS ||--o{ ROOM_MAINTENANCE : "undergoes"
    
    BREAKFAST_PACKAGES ||--o{ BOOKINGS : "includes"
    
    DISCOUNTS ||--o{ BOOKINGS : "applies to overall"
    DISCOUNTS ||--o{ BOOKING_DETAILS : "applies to item"
    
    BOOKINGS ||--o{ BOOKING_DETAILS : "includes"
    SERVICES ||--o{ BOOKING_DETAILS : "lists"
    
    BOOKINGS ||--o{ INVOICES : "generates"
    INVOICES ||--o{ PAYMENTS : "records"

    USERS {
        int user_id PK
        string username
        string email
        string role
    }

    GUESTS {
        int guest_id PK
        string first_name
        string last_name
        string email
        string phone
        string id_type "Passport, Driver's License"
        string id_number
    }

    ROOMS {
        int room_id PK
        string room_number
        string room_type
        decimal base_price
        string current_status "Available, Occupied, Out of Service"
        boolean is_clean
    }

    ROOM_MAINTENANCE {
        int maintenance_id PK
        int room_id FK
        int logged_by_user_id FK
        string issue_description
        date start_date
        date end_date
        string status "Pending, In Progress, Completed"
    }

    BOOKING_GUESTS {
        int booking_guest_id PK
        int booking_id FK
        int guest_id FK
        boolean is_primary_booker
    }

    BREAKFAST_PACKAGES {
        int breakfast_package_id PK
        string package_name
        string dietary_type
        decimal price_per_person
    }

    DISCOUNTS {
        int discount_id PK
        string code
        string discount_type "Percentage, Fixed"
        decimal discount_value
        date start_date
        date end_date
        boolean is_active
    }

    SERVICES {
        int service_id PK
        string service_name
        string description
        decimal price
    }

    BOOKINGS {
        int booking_id PK
        int user_id FK "Staff who processed booking"
        int room_id FK
        int breakfast_package_id FK
        int discount_id FK "Overall booking promo"
        int breakfast_guests_count
        date start_date
        date end_date
        string status "Confirmed, Checked In, Cancelled, Completed"
        datetime cancelled_at
        string cancellation_reason
        decimal subtotal_amount
        decimal total_discount_amount
        decimal final_booked_cost
    }

    BOOKING_DETAILS {
        int booking_detail_id PK
        int booking_id FK
        int service_id FK
        int discount_id FK "Item specific promo"
        int quantity
        decimal price_at_booking
        decimal line_discount_amount
        decimal subtotal
    }

    INVOICES {
        int invoice_id PK
        int booking_id FK
        decimal subtotal
        decimal tax_rate "e.g., 12% VAT"
        decimal tax_amount
        decimal tourism_fee
        decimal total_amount
        date issue_date
        string status "Pending, Partial, Fully Paid, Refunded"
    }

    PAYMENTS {
        int payment_id PK
        int invoice_id FK
        decimal amount "Negative values for refunds"
        string method "Credit Card, Cash, Insurance, Bank Transfer"
        string transaction_type "Payment, Refund, Security Deposit"
        datetime payment_date
    }
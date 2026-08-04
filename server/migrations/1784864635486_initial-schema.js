

/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

exports.up = (pgm) => {
  // // 1. Guests Table
  // pgm.createTable('guests', {
  //   id: 'id', // 'id' shorthand automatically creates a SERIAL PRIMARY KEY
  //   name: { type: 'varchar(100)', notNull: true },
  //   email: { type: 'varchar(100)' },
  //   phone: { type: 'varchar(20)', notNull: true },
  //   created_at: {
  //     type: 'timestamp',
  //     notNull: true,
  //     default: pgm.func('current_timestamp'),
  //   },
  // });

  // 2. Breakfasts Table (Replacing the hardcoded ENUM)
  pgm.createTable('breakfasts', {
    id: 'id',
    name: { type: 'varchar(50)', notNull: true },
    price: { type: 'numeric(10,2)', notNull: true },
  });

  // 3. Rooms Table
  // pgm.createTable('rooms', {
  //   id: 'id',
  //   room_number: { type: 'varchar(10)', notNull: true, unique: true },
  //   room_type: { type: 'varchar(50)', notNull: true },
  //   base_price: { type: 'numeric(10,2)', notNull: true },
  // });

  // 4. Bookings Table (Note: room_id is removed to support multiple rooms)
  // pgm.createTable('bookings', {
  //   id: 'id',
  //   guest_id: {
  //     type: 'integer',
  //     notNull: true,
  //     references: '"guests"',
  //     onDelete: 'CASCADE',
  //   },
  //   check_in: { type: 'date', notNull: true },
  //   check_out: { type: 'date', notNull: true },
  //   booking_status: { type: 'varchar(20)', notNull: true, default: 'confirmed' },
  //   payment_status: { type: 'varchar(20)', notNull: true, default: 'unpaid' },
  //   created_at: {
  //     type: 'timestamp',
  //     notNull: true,
  //     default: pgm.func('current_timestamp'),
  //   },
  // });

  // Adding strict CHECK constraints to prevent typos like 'penging'
  pgm.addConstraint('bookings', 'chk_booking_status', {
    check: `booking_status IN ('confirmed', 'cancelled', 'completed')`
  });
  pgm.addConstraint('bookings', 'chk_payment_status', {
    check: `payment_status IN ('unpaid', 'partial', 'paid')`
  });

  // 5. Booking_Rooms Join Table (Handles multiple rooms per booking)
  pgm.createTable('booking_rooms', {
    booking_id: {
      type: 'integer',
      notNull: true,
      references: '"bookings"',
      onDelete: 'CASCADE',
    },
    room_id: {
      type: 'integer',
      notNull: true,
      references: '"rooms"',
      onDelete: 'CASCADE',
    },
    price_at_booking: { type: 'numeric(10,2)', notNull: true },
    pax_count: { type: 'integer', notNull: true, default: 1 },
  });
  
  // Create a composite primary key so the same room isn't attached to the same booking twice
  pgm.addConstraint('booking_rooms', 'pk_booking_rooms', {
    primaryKey: ['booking_id', 'room_id']
  });

  // 6. Invoice_Items Dynamic Line Items Table
  pgm.createTable('invoice_items', {
    id: 'id',
    booking_id: {
      type: 'integer',
      notNull: true,
      references: '"bookings"',
      onDelete: 'CASCADE',
    },
    item_type: { type: 'varchar(50)', notNull: true }, // e.g., 'room', 'breakfast', 'damage'
    description: { type: 'text', notNull: true },
    amount: { type: 'numeric(10,2)', notNull: true },
    quantity: { type: 'integer', notNull: true, default: 1 },
  });
};

exports.down = (pgm) => {
  // Drop tables in the exact reverse order of creation to avoid foreign key violation errors
  pgm.dropTable('invoice_items');
  pgm.dropTable('booking_rooms');
  pgm.dropTable('bookings');
  pgm.dropTable('rooms');
  pgm.dropTable('breakfasts');
  pgm.dropTable('guests');
};


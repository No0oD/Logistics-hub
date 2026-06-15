import { Migration } from '@mikro-orm/migrations';

export class Migration20260615133201 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`users\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`first_name\` varchar(255) not null, \`last_name\` varchar(255) not null, \`role\` enum('admin', 'dispatcher', 'driver', 'viewer') not null default 'viewer', \`is_active\` tinyint(1) not null default true, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_email_unique\`(\`email\`);`);

    this.addSql(`create table \`drivers\` (\`id\` int unsigned not null auto_increment primary key, \`user_id\` int unsigned not null, \`license_number\` varchar(255) not null, \`vehicle_type\` varchar(255) not null, \`vehicle_plate\` varchar(255) not null, \`status\` enum('available', 'on_route', 'on_break', 'offline') not null default 'offline', \`current_lat\` numeric(10,6) null, \`current_lng\` numeric(10,6) null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`drivers\` add unique \`drivers_user_id_unique\`(\`user_id\`);`);

    this.addSql(`create table \`warehouses\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`address\` varchar(255) not null, \`city\` varchar(255) not null, \`latitude\` numeric(10,6) null, \`longitude\` numeric(10,6) null, \`capacity\` int not null, \`area_sqm\` numeric(10,2) null, \`type\` enum('distribution_center', 'sorting_hub', 'last_mile', 'cold_storage') not null default 'distribution_center', \`status\` enum('active', 'maintenance', 'closed') not null default 'active', \`zones\` json null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`shipments\` (\`id\` int unsigned not null auto_increment primary key, \`tracking_code\` varchar(255) not null, \`description\` varchar(255) not null, \`weight\` numeric(10,2) null, \`dimensions\` varchar(255) null, \`status\` enum('created', 'at_warehouse', 'in_transit', 'delivered', 'returned', 'lost') not null default 'created', \`priority\` enum('low', 'normal', 'high', 'express') not null default 'normal', \`warehouse_id\` int unsigned null, \`sender_id\` int unsigned not null, \`receiver_id\` int null, \`created_at\` datetime not null, \`updated_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`shipments\` add unique \`shipments_tracking_code_unique\`(\`tracking_code\`);`);
    this.addSql(`alter table \`shipments\` add index \`shipments_warehouse_id_index\`(\`warehouse_id\`);`);
    this.addSql(`alter table \`shipments\` add index \`shipments_sender_id_index\`(\`sender_id\`);`);

    this.addSql(`create table \`shipment_events\` (\`id\` int unsigned not null auto_increment primary key, \`shipment_id\` int unsigned not null, \`status\` enum('created', 'at_warehouse', 'in_transit', 'delivered', 'returned', 'lost') not null, \`location\` varchar(255) null, \`comment\` varchar(255) null, \`created_by\` int unsigned not null, \`created_at\` datetime not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`shipment_events\` add index \`shipment_events_shipment_id_index\`(\`shipment_id\`);`);
    this.addSql(`alter table \`shipment_events\` add index \`shipment_events_created_by_index\`(\`created_by\`);`);

    this.addSql(`create table \`routes\` (\`id\` int unsigned not null auto_increment primary key, \`driver_id\` int unsigned not null, \`shipment_id\` int unsigned not null, \`origin_id\` int unsigned not null, \`destination_id\` int unsigned not null, \`status\` enum('planned', 'in_progress', 'completed', 'cancelled') not null default 'planned', \`estimated_at\` datetime null, \`started_at\` datetime null, \`completed_at\` datetime null, \`distance\` numeric(10,2) null, \`notes\` varchar(255) null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`routes\` add index \`routes_driver_id_index\`(\`driver_id\`);`);
    this.addSql(`alter table \`routes\` add unique \`routes_shipment_id_unique\`(\`shipment_id\`);`);
    this.addSql(`alter table \`routes\` add index \`routes_origin_id_index\`(\`origin_id\`);`);
    this.addSql(`alter table \`routes\` add index \`routes_destination_id_index\`(\`destination_id\`);`);

    this.addSql(`alter table \`drivers\` add constraint \`drivers_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`shipments\` add constraint \`shipments_warehouse_id_foreign\` foreign key (\`warehouse_id\`) references \`warehouses\` (\`id\`) on update cascade on delete set null;`);
    this.addSql(`alter table \`shipments\` add constraint \`shipments_sender_id_foreign\` foreign key (\`sender_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`shipment_events\` add constraint \`shipment_events_shipment_id_foreign\` foreign key (\`shipment_id\`) references \`shipments\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`shipment_events\` add constraint \`shipment_events_created_by_foreign\` foreign key (\`created_by\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`routes\` add constraint \`routes_driver_id_foreign\` foreign key (\`driver_id\`) references \`drivers\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`routes\` add constraint \`routes_shipment_id_foreign\` foreign key (\`shipment_id\`) references \`shipments\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`routes\` add constraint \`routes_origin_id_foreign\` foreign key (\`origin_id\`) references \`warehouses\` (\`id\`) on update cascade;`);
    this.addSql(`alter table \`routes\` add constraint \`routes_destination_id_foreign\` foreign key (\`destination_id\`) references \`warehouses\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`drivers\` drop foreign key \`drivers_user_id_foreign\`;`);

    this.addSql(`alter table \`shipments\` drop foreign key \`shipments_sender_id_foreign\`;`);

    this.addSql(`alter table \`shipment_events\` drop foreign key \`shipment_events_created_by_foreign\`;`);

    this.addSql(`alter table \`routes\` drop foreign key \`routes_driver_id_foreign\`;`);

    this.addSql(`alter table \`shipments\` drop foreign key \`shipments_warehouse_id_foreign\`;`);

    this.addSql(`alter table \`routes\` drop foreign key \`routes_origin_id_foreign\`;`);

    this.addSql(`alter table \`routes\` drop foreign key \`routes_destination_id_foreign\`;`);

    this.addSql(`alter table \`shipment_events\` drop foreign key \`shipment_events_shipment_id_foreign\`;`);

    this.addSql(`alter table \`routes\` drop foreign key \`routes_shipment_id_foreign\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`drivers\`;`);

    this.addSql(`drop table if exists \`warehouses\`;`);

    this.addSql(`drop table if exists \`shipments\`;`);

    this.addSql(`drop table if exists \`shipment_events\`;`);

    this.addSql(`drop table if exists \`routes\`;`);
  }

}

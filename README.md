# Warehouse Management System (WMS)

[![Java Version](https://img.shields.io/badge/Java-17%2B-blue.svg)](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
[![Spring Boot Version](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-blue.svg)](https://www.postgresql.org/)


## 📋 Executive Summary

The exponential growth of e-commerce has placed immense pressure on traditional warehouse operations, which often rely on fragmented, manual processes. These outdated methods lead to critical issues such as inaccurate inventory synchronization, misplaced stock, inefficient worker routing, costly stockouts, and delayed order fulfilment.

This project delivers a robust, cloud-based **Warehouse Management System (WMS)** designed to be the digital backbone for mid-sized logistics companies transitioning to automated supply chain management. The platform automates core warehouse operations by providing real-time inventory tracking, optimized receiving and put-away logic, and efficient order-picking workflows.

## 🎯 Core Business Objectives

- **Real-Time Inventory Engine**: Prevent race conditions during concurrent stock updates, maintaining absolute data accuracy
- **ACID-Compliant Transactions**: Guarantee transactional integrity across the database to prevent data corruption
- **Automated Data Capture**: Generate and process barcode/QR code data to minimize manual data entry
- **High Performance**: API response times below **200 milliseconds** for seamless warehouse scanning operations

## 👥 User Personas

| Persona | Primary Needs | System Interaction |
|---------|--------------|-------------------|
| **Warehouse Manager** | Inventory visibility, capacity optimization, supplier management | Analytical dashboard for monitoring stock thresholds, generating purchase orders, tracking efficiency |
| **Floor Operator** | Clear location instructions, automated data entry | Mobile interface for scanning items, receiving put-away instructions, picking orders |

## ✨ MVP Features

### 1. Hierarchical Inventory Catalog
Database schema managing physical relationships:

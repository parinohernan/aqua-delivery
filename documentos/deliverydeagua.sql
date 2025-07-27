/*
Navicat MySQL Data Transfer

Source Server         : localhost
Source Server Version : 50622
Source Host           : localhost:3306
Source Database       : deliverydeagua

Target Server Type    : MYSQL
Target Server Version : 50622
File Encoding         : 65001

Date: 2025-07-25 19:59:59
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for clientes
-- ----------------------------
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `descripcion` text,
  `direccion` varchar(100) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `retornables` int(11) DEFAULT NULL,
  `saldo` decimal(10,2) DEFAULT '0.00',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `codigoEmpresa` varchar(8) NOT NULL,
  PRIMARY KEY (`codigo`,`codigoEmpresa`),
  KEY `idx_clientes_activo` (`activo`),
  KEY `idx_clientes_empresa_activo` (`codigoEmpresa`,`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for cobropedido
-- ----------------------------
DROP TABLE IF EXISTS `cobropedido`;
CREATE TABLE `cobropedido` (
  `codigo` int(11) NOT NULL,
  `codigoCobro` int(11) NOT NULL,
  `codigoPedido` int(11) NOT NULL,
  `saldo` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for cobros
-- ----------------------------
DROP TABLE IF EXISTS `cobros`;
CREATE TABLE `cobros` (
  `codigo` int(11) NOT NULL,
  `codigoVendedor` int(11) NOT NULL,
  `codigoEmpresa` int(11) NOT NULL,
  `codigoCliente` int(11) NOT NULL,
  `pagoTipo` varchar(255) NOT NULL,
  `fechaCobro` double NOT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `pagoTipo` (`pagoTipo`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for empresa
-- ----------------------------
DROP TABLE IF EXISTS `empresa`;
CREATE TABLE `empresa` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `razonSocial` varchar(100) NOT NULL,
  `imageURL` varchar(500) DEFAULT NULL,
  `textoInfo` varchar(255) DEFAULT NULL,
  `fechaAlta` date DEFAULT NULL,
  `fechaVencimiento` date DEFAULT NULL,
  `plan` varchar(8) DEFAULT NULL,
  `usaEntregaProgramada` tinyint(1) NOT NULL DEFAULT '0',
  `usaRepartoPorZona` tinyint(1) NOT NULL DEFAULT '0',
  `husoHorario` int(11) DEFAULT '0' COMMENT 'Ajuste del huso horario en horas',
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for pedidos
-- ----------------------------
DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `codigoEmpresa` int(11) NOT NULL,
  `codigoCliente` int(11) NOT NULL,
  `codigoVendedorPedido` int(11) NOT NULL,
  `codigoVendedorEntrega` int(11) DEFAULT NULL,
  `saldo` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `tipoPago` varchar(10) DEFAULT NULL,
  `FechaPedido` datetime DEFAULT NULL,
  `FechaProgramada` datetime DEFAULT NULL,
  `FechaEntrega` datetime DEFAULT NULL,
  `fechaPago` date DEFAULT NULL,
  `estado` varchar(8) DEFAULT NULL,
  `zona` varchar(18) DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `codigoEmpresa` (`codigoEmpresa`),
  KEY `codigoCliente` (`codigoCliente`),
  KEY `codigoVendedorPedido` (`codigoVendedorPedido`),
  KEY `codigoVendedorEntrega` (`codigoVendedorEntrega`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`codigoEmpresa`) REFERENCES `empresa` (`codigo`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`codigoCliente`) REFERENCES `clientes` (`codigo`),
  CONSTRAINT `pedidos_ibfk_3` FOREIGN KEY (`codigoVendedorPedido`) REFERENCES `vendedores` (`codigo`),
  CONSTRAINT `pedidos_ibfk_4` FOREIGN KEY (`codigoVendedorEntrega`) REFERENCES `vendedores` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for pedidositems
-- ----------------------------
DROP TABLE IF EXISTS `pedidositems`;
CREATE TABLE `pedidositems` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `codigoPedido` int(11) NOT NULL,
  `codigoProducto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `precioTotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`codigo`),
  KEY `codigoPedido` (`codigoPedido`),
  KEY `codigoProducto` (`codigoProducto`),
  CONSTRAINT `pedidositems_ibfk_1` FOREIGN KEY (`codigoPedido`) REFERENCES `pedidos` (`codigo`),
  CONSTRAINT `pedidositems_ibfk_2` FOREIGN KEY (`codigoProducto`) REFERENCES `productos` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for productos
-- ----------------------------
DROP TABLE IF EXISTS `productos`;
CREATE TABLE `productos` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `codigoEmpresa` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `activo` tinyint(4) NOT NULL,
  `esRetornable` tinyint(4) NOT NULL,
  PRIMARY KEY (`codigo`),
  KEY `codigoEmpresa` (`codigoEmpresa`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`codigoEmpresa`) REFERENCES `empresa` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for tiposdepago
-- ----------------------------
DROP TABLE IF EXISTS `tiposdepago`;
CREATE TABLE `tiposdepago` (
  `codigoEmpresa` int(11) NOT NULL,
  `id` int(11) NOT NULL,
  `pago` varchar(20) NOT NULL,
  `aplicaSaldo` bit(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for vendedores
-- ----------------------------
DROP TABLE IF EXISTS `vendedores`;
CREATE TABLE `vendedores` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `codigoEmpresa` int(11) NOT NULL,
  `telegramId` varchar(50) DEFAULT NULL,
  `alias` varchar(50) DEFAULT NULL,
  `nombre` varchar(50) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `zona` varchar(11) DEFAULT NULL,
  PRIMARY KEY (`codigo`),
  KEY `codigoEmpresa` (`codigoEmpresa`),
  CONSTRAINT `vendedores_ibfk_1` FOREIGN KEY (`codigoEmpresa`) REFERENCES `empresa` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for zonas
-- ----------------------------
DROP TABLE IF EXISTS `zonas`;
CREATE TABLE `zonas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `zona` varchar(100) NOT NULL,
  `codigoEmpresa` varchar(50) NOT NULL,
  `fechaCreacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `zona_empresa_unique` (`zona`,`codigoEmpresa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = length(var.availability_zones) > 0 ? var.availability_zones : slice(data.aws_availability_zones.available.names, 0, 3)
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-vpc"
    }
  )
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-igw"
    }
  )
}

resource "aws_subnet" "public" {
  count             = length(local.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone = local.azs[count.index]

  map_public_ip_on_launch = true

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-public-${local.azs[count.index]}"
      Type = "public"
    }
  )
}

resource "aws_subnet" "private" {
  count             = length(local.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + length(local.azs))
  availability_zone = local.azs[count.index]

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-private-${local.azs[count.index]}"
      Type = "private"
    }
  )
}

resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(local.azs)) : 0
  domain = "vpc"

  depends_on = [aws_internet_gateway.main]

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-nat-eip-${count.index + 1}"
    }
  )
}

resource "aws_nat_gateway" "main" {
  count         = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(local.azs)) : 0
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  depends_on = [aws_internet_gateway.main]

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-nat-${count.index + 1}"
    }
  )
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-public-rt"
    }
  )
}

resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? length(local.azs) : 0
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = var.single_nat_gateway ? aws_nat_gateway.main[0].id : aws_nat_gateway.main[count.index].id
  }

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-private-rt-${count.index + 1}"
    }
  )
}

resource "aws_route_table_association" "public" {
  count          = length(local.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = var.enable_nat_gateway ? length(local.azs) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = var.single_nat_gateway ? aws_route_table.private[0].id : aws_route_table.private[count.index].id
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${data.aws_availability_zones.available.id}.s3"

  tags = merge(
    var.tags,
    {
      Name = "${var.name_prefix}-s3-endpoint"
    }
  )
}

resource "aws_vpc_endpoint_route_table_association" "s3_public" {
  route_table_id  = aws_route_table.public.id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

resource "aws_vpc_endpoint_route_table_association" "s3_private" {
  count           = var.enable_nat_gateway ? length(local.azs) : 0
  route_table_id  = var.single_nat_gateway ? aws_route_table.private[0].id : aws_route_table.private[count.index].id
  vpc_endpoint_id = aws_vpc_endpoint.s3.id
}

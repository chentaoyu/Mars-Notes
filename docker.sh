#!/bin/bash

# ========================================
# Docker 管理脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检测 Docker Compose 命令
detect_docker_compose() {
    # 优先使用 docker compose（新版本）
    if docker compose version &> /dev/null; then
        echo "docker compose"
    # 回退到 docker-compose（旧版本）
    elif command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        return 1
    fi
}

# 获取 Docker Compose 命令
DOCKER_COMPOSE=""
get_docker_compose_cmd() {
    if [ -z "$DOCKER_COMPOSE" ]; then
        DOCKER_COMPOSE=$(detect_docker_compose)
        if [ $? -ne 0 ]; then
            print_error "Docker Compose 未安装或无法使用"
            print_info "请确保已安装 Docker Desktop 或 Docker Engine + Docker Compose"
            print_info "访问：https://docs.docker.com/get-docker/"
            exit 1
        fi
    fi
    echo "$DOCKER_COMPOSE"
}

# 检查 .env 文件
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在"
        print_info "正在从 .env.example 创建 .env 文件..."
        if [ -f .env.example ]; then
            cp .env.example .env
            print_success ".env 文件已创建，请编辑该文件并配置必要的环境变量"
            print_warning "重要：请务必修改 NEXTAUTH_SECRET 和 POSTGRES_PASSWORD"
            exit 0
        else
            print_error ".env.example 文件不存在"
            exit 1
        fi
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
${GREEN}Docker 管理脚本${NC}

${YELLOW}用法:${NC}
  ./docker.sh [命令]

${YELLOW}命令:${NC}
  ${GREEN}开发环境:${NC}
    dev:up          启动开发环境
    dev:down        停止开发环境
    dev:restart     重启开发环境
    dev:logs        查看开发环境日志
    dev:build       重新构建开发环境

  ${GREEN}生产环境:${NC}
    prod:up         启动生产环境
    prod:down       停止生产环境
    prod:restart    重启生产环境
    prod:logs       查看生产环境日志
    prod:build      重新构建生产环境

  ${GREEN}数据库:${NC}
    db:migrate      执行数据库迁移
    db:studio       打开 Prisma Studio
    db:backup       备份数据库
    db:restore      恢复数据库

  ${GREEN}工具:${NC}
    ps              查看容器状态
    logs            查看所有日志
    clean           清理容器和镜像
    clean:all       清理所有（包括数据卷）
    help            显示此帮助信息

${YELLOW}示例:${NC}
  ./docker.sh dev:up
  ./docker.sh prod:up
  ./docker.sh db:migrate

EOF
}

# 开发环境命令
dev_up() {
    local dc=$(get_docker_compose_cmd)
    print_info "启动开发环境..."
    $dc -f docker-compose.dev.yml up -d
    print_success "开发环境已启动"
    print_info "应用地址: http://localhost:3000"
}

dev_down() {
    local dc=$(get_docker_compose_cmd)
    print_info "停止开发环境..."
    $dc -f docker-compose.dev.yml down
    print_success "开发环境已停止"
}

dev_restart() {
    local dc=$(get_docker_compose_cmd)
    print_info "重启开发环境..."
    $dc -f docker-compose.dev.yml restart
    print_success "开发环境已重启"
}

dev_logs() {
    local dc=$(get_docker_compose_cmd)
    $dc -f docker-compose.dev.yml logs -f
}

dev_build() {
    local dc=$(get_docker_compose_cmd)
    print_info "重新构建开发环境..."
    $dc -f docker-compose.dev.yml up -d --build
    print_success "开发环境已重新构建"
}

# 生产环境命令
prod_up() {
    local dc=$(get_docker_compose_cmd)
    print_info "启动生产环境..."
    $dc up -d
    print_success "生产环境已启动"
    print_info "应用地址: http://localhost:3000"
}

prod_down() {
    local dc=$(get_docker_compose_cmd)
    print_info "停止生产环境..."
    $dc down
    print_success "生产环境已停止"
}

prod_restart() {
    local dc=$(get_docker_compose_cmd)
    print_info "重启生产环境..."
    $dc restart
    print_success "生产环境已重启"
}

prod_logs() {
    local dc=$(get_docker_compose_cmd)
    $dc logs -f
}

prod_build() {
    local dc=$(get_docker_compose_cmd)
    print_info "重新构建生产环境..."
    $dc up -d --build
    print_success "生产环境已重新构建"
}

# 数据库命令
db_migrate() {
    local dc=$(get_docker_compose_cmd)
    print_info "执行数据库迁移..."
    if docker ps | grep -q notebook-app; then
        $dc exec app npx prisma migrate deploy
        print_success "数据库迁移完成"
    elif docker ps | grep -q notebook-app-dev; then
        $dc -f docker-compose.dev.yml exec app npx prisma migrate deploy
        print_success "数据库迁移完成"
    else
        print_error "应用容器未运行，请先启动环境"
        exit 1
    fi
}

db_studio() {
    local dc=$(get_docker_compose_cmd)
    print_info "启动 Prisma Studio..."
    if docker ps | grep -q notebook-app; then
        $dc exec app npx prisma studio
    elif docker ps | grep -q notebook-app-dev; then
        $dc -f docker-compose.dev.yml exec app npx prisma studio
    else
        print_error "应用容器未运行，请先启动环境"
        exit 1
    fi
}

db_backup() {
    local dc=$(get_docker_compose_cmd)
    print_info "备份数据库..."
    BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
    if docker ps | grep -q notebook-postgres; then
        $dc exec -T postgres pg_dump -U notebook notebook > "$BACKUP_FILE"
        print_success "数据库已备份到: $BACKUP_FILE"
    elif docker ps | grep -q notebook-postgres-dev; then
        $dc -f docker-compose.dev.yml exec -T postgres pg_dump -U notebook notebook_dev > "$BACKUP_FILE"
        print_success "数据库已备份到: $BACKUP_FILE"
    else
        print_error "数据库容器未运行"
        exit 1
    fi
}

db_restore() {
    local dc=$(get_docker_compose_cmd)
    if [ -z "$2" ]; then
        print_error "请指定备份文件: ./docker.sh db:restore <backup-file>"
        exit 1
    fi
    
    BACKUP_FILE="$2"
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "确认要恢复数据库吗？这将覆盖现有数据！"
    read -p "输入 'yes' 继续: " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "操作已取消"
        exit 0
    fi
    
    print_info "恢复数据库..."
    if docker ps | grep -q notebook-postgres; then
        $dc exec -T postgres psql -U notebook notebook < "$BACKUP_FILE"
        print_success "数据库已恢复"
    elif docker ps | grep -q notebook-postgres-dev; then
        $dc -f docker-compose.dev.yml exec -T postgres psql -U notebook notebook_dev < "$BACKUP_FILE"
        print_success "数据库已恢复"
    else
        print_error "数据库容器未运行"
        exit 1
    fi
}

# 工具命令
show_ps() {
    local dc=$(get_docker_compose_cmd)
    print_info "容器状态:"
    $dc ps 2>/dev/null || true
    $dc -f docker-compose.dev.yml ps 2>/dev/null || true
}

show_logs() {
    local dc=$(get_docker_compose_cmd)
    if docker ps | grep -q notebook-app-dev; then
        $dc -f docker-compose.dev.yml logs -f
    else
        $dc logs -f
    fi
}

clean() {
    local dc=$(get_docker_compose_cmd)
    print_warning "清理容器和镜像..."
    $dc down 2>/dev/null || true
    $dc -f docker-compose.dev.yml down 2>/dev/null || true
    print_success "清理完成"
}

clean_all() {
    local dc=$(get_docker_compose_cmd)
    print_warning "这将删除所有容器、镜像和数据卷！"
    read -p "确认要继续吗？输入 'yes' 确认: " confirm
    if [ "$confirm" != "yes" ]; then
        print_info "操作已取消"
        exit 0
    fi
    
    print_warning "清理所有资源..."
    $dc down -v --rmi all 2>/dev/null || true
    $dc -f docker-compose.dev.yml down -v --rmi all 2>/dev/null || true
    print_success "清理完成"
}

# 主逻辑
main() {
    # 检查 Docker 是否安装
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        print_info "访问：https://docs.docker.com/get-docker/"
        exit 1
    fi

    # 如果没有参数，显示帮助
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # 除了 help 命令外，都需要检查命令和 .env
    if [ "$1" != "help" ]; then
        # 检查 Docker Compose（会在第一次调用时检测）
        get_docker_compose_cmd > /dev/null
        
        # 检查 .env 文件
        check_env
    fi

    # 执行命令
    case "$1" in
        dev:up)
            dev_up
            ;;
        dev:down)
            dev_down
            ;;
        dev:restart)
            dev_restart
            ;;
        dev:logs)
            dev_logs
            ;;
        dev:build)
            dev_build
            ;;
        prod:up)
            prod_up
            ;;
        prod:down)
            prod_down
            ;;
        prod:restart)
            prod_restart
            ;;
        prod:logs)
            prod_logs
            ;;
        prod:build)
            prod_build
            ;;
        db:migrate)
            db_migrate
            ;;
        db:studio)
            db_studio
            ;;
        db:backup)
            db_backup
            ;;
        db:restore)
            db_restore "$@"
            ;;
        ps)
            show_ps
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean
            ;;
        clean:all)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主程序
main "$@"


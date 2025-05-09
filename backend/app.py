from flask import request, jsonify
from datetime import datetime

@app.route('/api/logs', methods=['POST'])
def add_log():
    try:
        log_data = request.json
        level = log_data.get('level', 'info')
        message = log_data.get('message', '')
        details = log_data.get('details')
        timestamp = log_data.get('timestamp', datetime.now().isoformat())

        # 记录日志
        logger.log(level, message, extra={'details': details, 'timestamp': timestamp})
        
        return jsonify({'message': '日志记录成功'}), 200
    except Exception as e:
        logger.error('记录日志失败', exc_info=True)
        return jsonify({'error': '记录日志失败', 'details': str(e)}), 500 
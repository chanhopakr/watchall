from io import BytesIO
from urllib.parse import quote

import hashlib
import os
import time

from django.http import HttpResponse
from xlwt import Alignment, Font, Pattern, Workbook, XFStyle

import xlsxwriter

try:
    import ujson as json
except:
    import json

try:
    xrange
except NameError:
    xrange = range


class Excel:
    def __init__(self, encoding='utf-8'):
        self.book = Workbook(encoding=encoding)
        self.sheet_total = 0

    def add_sheet(self, title='', columns=None, data=None, description=None,
                  **kwargs):
        columns = columns or []
        data = data or []
        self.sheet_total += 1
        title = title or f"Sheet{self.sheet_total}"

        sheet = self.book.add_sheet(title)

        # column title
        style = self.get_title_style(center=False)
        row_index = 0

        if description:
            if isinstance(description, str):
                description_ = [description]
            else:
                description_ = description

            if isinstance(description_, (list, tuple)):
                for text in description_:
                    sheet.write(row_index, 0, text, style)
                    sheet.row(row_index).set_style(style)
                    row_index += 1

        style = self.get_title_style()
        for col_index, column in enumerate(columns):
            sheet.write(row_index, col_index, column.get('text', ''), style)
            # 0x0d00 + width
            sheet.col(col_index).width = column.get('width', 100) * 32

        sheet.row(row_index).set_style(style)
        row_index += 1

        style = XFStyle()
        style.alignment.wrap = 1
        style.alignment.vert = Alignment.VERT_TOP
        style.alignment.horz = Alignment.HORZ_LEFT

        for row_index_, record in enumerate(data, start=row_index):
            for col_index, column in enumerate(columns):
                value = record.get(column.get('dataIndex', ''), '')
                sheet.write(row_index_, col_index, value, style)
        return sheet

    @staticmethod
    def get_title_style(center=True):
        pat = Pattern()
        pat.pattern = Pattern.SOLID_PATTERN
        pat.pattern_fore_colour = 0x16

        font = Font()
        font.bold = True

        align = Alignment()
        if center:
            align.horz = Alignment.HORZ_CENTER
        align.vert = Alignment.VERT_CENTER

        style = XFStyle()
        style.font = font
        style.pattern = pat
        style.alignment = align

        return style

    @staticmethod
    def get_style(font_name=None, font_style=None, align=None, bgcolor=None):
        style = XFStyle()
        if bgcolor:
            pat = Pattern()
            pat.pattern = Pattern.SOLID_PATTERN
            pat.pattern_fore_colour = bgcolor  # 0x16
            style.pattern = pat

        if font_name or font_style:
            font = Font()
            font.bold = True
            style.font = font

        if align:
            align = Alignment()
            align.horz = Alignment.HORZ_CENTER
            align.vert = Alignment.VERT_CENTER
            style.alignment = align

        return style

    def save(self, file):
        file_abspath = os.path.abspath(file)
        abspath, filename = os.path.split(file_abspath)
        os.makedirs(abspath, exist_ok=True)
        temp_filename = hashlib.sha1().hexdigest()
        self.book.save(os.path.join(abspath, temp_filename))
        os.rename(os.path.join(abspath, temp_filename), file_abspath)


class Excel_xlsx():
    def __init__(self, file_name=''):
        self.buf = BytesIO()
        if file_name:
            self.workbook = xlsxwriter.Workbook(os.path.join('/opt/zen/var/kt_tms/cpm_report', file_name))
            self.file_name = file_name
        else:
            self.workbook = xlsxwriter.Workbook(self.buf, {'in_memory': True})
            self.file_name = None
        self.format = self.workbook.add_format()
        # self.format.set_font_name('Arial')
        self.format.set_font_size(10)
        self.sheet_cnt = 0

    def mergeCheckColumn(self, data, rows, column, columnLen):
        if column + 1 < columnLen and data[rows][column] == data[rows][column + 1]:
            column = self.mergeCheckColumn(data, rows, column + 1, columnLen)
        return column

    def mergeCheckRows(self, data, rows, column, rowsLen):
        if rows + 1 < rowsLen and data[rows][column] == data[rows + 1][column]:
            rows = self.mergeCheckRows(data, rows + 1, column, rowsLen)
        return rows

    def download(self, request, data, excel='',unit='', title=None, subtitle='',subtitle2='',subtitle3='', merge=None, header=None, columns=None, number=None, mark_row=0, sheet=False, grid=None, cpm_mail=False):
        header = header or []
        tempColumns = columns or []
        merge = merge or {}
        number = number or {}

        option = {}
        subtitle_list = []
        if unit:
            option.update({'unit': unit})
        if subtitle:
            option.update({'subtitle': subtitle})
        if subtitle2:
            if cpm_mail:
                subtitle_list.append("데이터: 개별조회")
                subtitle_list.append("데이터: 합계조회")
            else:
                option.update({'subtitle2': subtitle2})
        if subtitle3:
            option.update({'subtitle3': subtitle3})

        columns = []
        if cpm_mail:
            columns = tempColumns
        else:
            for column in tempColumns:
                columns.append((column[0], column[1], column[2]))

        # merge
        rows_check = False
        column_check = False
        rows_set = False
        if merge:
            tempData = merge
            rows_check = tempData.get('rows_check')
            rows_set = tempData.get('rows_set')
            column_check = tempData.get('column_check')

        # number
        number_list = []
        if number:
            if not cpm_mail:
                tempData = number
                int_cell = tempData.get('int_cell')
                float_cell = tempData.get('float_cell')
            else:
                number_list.extend(number)
        else:
            int_cell = []
            float_cell = []

        if sheet:
            for idx, d in enumerate(data):
                if cpm_mail:
                    _mark_row = mark_row[idx]
                    option['subtitle2'] = subtitle_list[idx]
                    int_cell = number_list[idx].get('int_cell')
                    float_cell = number_list[idx].get('float_cell')
                else:
                    _mark_row = mark_row

                self.add_sheet(
                    d[0],
                    header[idx] if cpm_mail else header,
                    columns[idx] if cpm_mail else columns,
                    d[2],
                    option,
                    d[1],
                    rows_check,
                    column_check,
                    rows_set,
                    int_cell,
                    float_cell,
                    _mark_row
                )
        else:
            if len(data) > 1000000:
                loop_num = len(data) / 1000000
                for i in range(loop_num + 1):
                    if i > 0:
                        mark_row = 0
                    self.add_sheet(
                        'sheet%s' % (str(i+1)),
                        header,
                        columns,
                        data[i * 1000000:i * 1000000 + 999999],
                        option,
                        title,
                        rows_check,
                        column_check,
                        rows_set,
                        int_cell,
                        float_cell,
                        mark_row
                    )
            else:
                self.add_sheet(
                    'sheet1',
                    header,
                    columns,
                    data,
                    option,
                    title,
                    rows_check,
                    column_check,
                    rows_set,
                    int_cell,
                    float_cell,
                    mark_row
                )
        self.workbook.close()

        if not self.file_name:
            fileName = self.get_attach_filename(request, '%s_%s.xlsx' % (title, time.strftime('%Y%m%d%H%M', time.localtime(time.time()))))
            response = HttpResponse(self.buf.getvalue(), content_type='application/vnd.ms-excel')
            response['Content-Disposition'] = 'attachment; filename="%s"' % fileName
            return response

    def get_attach_filename(self, request, filename):
        # if isinstance(filename, unicode):
        #     filename = filename.encode('utf-8')
        #
        agent = request.META.get('HTTP_USER_AGENT')
        if 'MSIE' in agent:
            return quote(filename)
        elif 'Trident' in agent:
            return quote(filename)
        elif 'Firefox' in agent:
            return filename
        elif 'Mozilla' in agent:
            return quote(filename)
        else:  # Safari, Opera
            return filename

    def get_title_style(self, center=True):
        format = self.workbook.add_format()
        format.set_font_size(10)
        format.set_pattern(1)
        format.set_bold()
        format.set_fg_color('#CCCCCC')  # gray80

        if center:
            format.set_align('center')
        format.set_align('vcenter')
        format.set_border(1)
        return format

    def get_style(self, font_name=None, font_style=None, align=None, bgcolor=None, mark=None):
        format = self.workbook.add_format()
        format.set_text_wrap(True)
        format.set_font_size(10)
        if bgcolor:
            format.set_pattern(1)
            format.set_fg_color('#CCCCCC')  # gray80

        if font_name or font_style:
            format.set_bold()

        if align:
            format.set_align('center')
            format.set_align('vcenter')

        if mark:
            format.set_fg_color('#FFFF00')
        return format

    def get_number_style(self, int_type=True, font_name=None, font_style=None, align=None, bgcolor=None, mark=None):
        format = self.workbook.add_format()
        format.set_text_wrap(True)
        format.set_font_size(10)
        if bgcolor:
            format.set_pattern(1)
            format.set_fg_color('#CCCCCC')  # gray80

        if font_name or font_style:
            format.set_bold()

        if align:
            format.set_align('center')
            format.set_align('vcenter')

        if int_type:
            format.set_num_format('#,##0')
        else:
            format.set_num_format('#,##0.00')

        if mark:
            format.set_fg_color('#FFFF00')
        return format

    def setMerge(self, worksheet, data, style, ROWS_START, rowsLen, COLUMN_START, columnLen, rowsCheck, columnCheck, rowsSet):
        MERGE_DATA = []
        for rows in xrange(ROWS_START, ROWS_START + rowsLen):
            for column in rowsSet or xrange(COLUMN_START, COLUMN_START + columnLen):

                if rowsCheck:
                    tempRows = self.mergeCheckRows(data, rows - ROWS_START, column - COLUMN_START, rowsLen) + ROWS_START
                else:
                    tempRows = rows
                if columnCheck:
                    tempColumn = self.mergeCheckColumn(data, rows - ROWS_START, column - COLUMN_START, columnLen) + COLUMN_START
                else:
                    tempColumn = column

                value = data[rows - ROWS_START][column - COLUMN_START]
                MERGE_DATA.append([rows, column, tempRows, tempColumn, value])

        for row1, col1, row2, col2, value in MERGE_DATA:
            worksheet.merge_range(row1, col1, row2, col2, value, style)

    def add_sheet(self, title='', header=None, settings=None, rs=None, options=None, desc='', rows_check=False, column_check=False, rows_set=False, int_cell=False, float_cell=False, mark_row=0):
        if header is None:
            header = []

        if settings is None:
            settings = []
        else:
            _settings = []
            for a, b, c in settings:
                a = a.replace('<br>', '')
                _settings.append((a, b, c))
            settings = _settings

        if rs is None:
            rs = []

        self.sheet_cnt += 1
        if not title:
            worksheet = self.workbook.add_worksheet()
        else:
            worksheet = self.workbook.add_worksheet(title)

        # column title
        ROWS = 0
        ROWS_START = 0
        COLUMN_START = 0
        COLUMN_SIZE = len(settings) - 1

        if desc:
            worksheet.merge_range(0, 0, 0, COLUMN_SIZE, desc, self.format) # (row1, col1, row2, col2)
            ROWS_START += 2

        if options:
            subtitle = options.get('subtitle')
            if subtitle:
                worksheet.merge_range(1, 0, 1, COLUMN_SIZE, subtitle, self.format)  # (row1, col1, row2, col2)
                ROWS_START += 1
            subtitle2 = options.get('subtitle2')
            if subtitle2:
                worksheet.merge_range(2, 0, 2, COLUMN_SIZE, subtitle2, self.format)  # (row1, col1, row2, col2)
                ROWS_START += 1
            subtitle3 = options.get('subtitle3')
            if subtitle3:
                worksheet.merge_range(3, 0, 3, COLUMN_SIZE, subtitle3, self.format)  # (row1, col1, row2, col2)
                ROWS_START += 1

            unit = options.get('unit')
            if unit:
                style = self.get_style()
                worksheet.write(ROWS + ROWS_START, COLUMN_SIZE, '단위: %s' % unit, style)
                ROWS_START += 1

        style = self.get_title_style()
        for head in header[:len(header) - 1]:
            for col, h in enumerate(head):
                worksheet.write(ROWS + ROWS_START, col, h, style)
            ROWS += 1

        for col, (column_title, _, width) in enumerate(settings):
            if not width:  # width, not pixel
                width = 68.5
            worksheet.set_column(col, col, width * 0.14)
            worksheet.write(ROWS + ROWS_START, col, column_title, style)
        ROWS += 1
        # head merge
        rowsLen = len(header)
        columnLen = len(settings)
        if rowsLen > 1:
            self.setMerge(worksheet, header, style, ROWS_START, rowsLen, COLUMN_START, columnLen, True, True, False)

        style = self.get_style()
        columns = [x[1] for x in settings]  # column keys

        STYLE = {}
        for col, column in enumerate(columns):
            if col in int_cell:
                STYLE[col] = self.get_number_style(int_type=True)
                STYLE['mark_%s' % col] = self.get_number_style(int_type=True, mark=True)
            elif col in float_cell:
                STYLE[col] = self.get_number_style(int_type=False)
                STYLE['mark_%s' % col] = self.get_number_style(int_type=False, mark=True)
            else:
                STYLE[col] = self.get_style()
                STYLE['mark_%s' % col] = self.get_style(mark=True)

        tempData = []
        if mark_row:
            mark_row = mark_row + ROWS + ROWS_START
        for r in rs:
            temp = []
            for col, column in enumerate(columns):
                value = r.get(column)
                temp.append(value)
                if mark_row and ROWS + ROWS_START == mark_row:
                    if col in int_cell:
                        try:
                            worksheet.write_number(ROWS + ROWS_START, int(col), int(value) , STYLE['mark_%s' % col])
                        except:
                            worksheet.write(ROWS + ROWS_START, int(col), value, STYLE['mark_%s' % col])
                    elif col in float_cell:
                        try:
                            worksheet.write_number(ROWS + ROWS_START, int(col), float(value), STYLE['mark_%s' % col])
                        except:
                            worksheet.write(ROWS + ROWS_START, int(col), value, STYLE['mark_%s' % col])
                    else:
                        worksheet.write(ROWS + ROWS_START, int(col), value, STYLE['mark_%s' % col])
                else:
                    if col in int_cell:
                        try:
                            worksheet.write_number(ROWS + ROWS_START, int(col), int(value), STYLE[col])
                        except:
                            worksheet.write(ROWS + ROWS_START, int(col), value, STYLE[col])
                    elif col in float_cell:
                        try:
                            worksheet.write_number(ROWS + ROWS_START, int(col), float(value), STYLE[col])
                        except:
                            worksheet.write(ROWS + ROWS_START, int(col), value, STYLE[col])
                    else:
                        worksheet.write(ROWS + ROWS_START, int(col), value, STYLE[col])
            tempData.append(temp)
            ROWS += 1

        if rows_check or column_check or rows_set:
            # data merge
            rowsLen = len(tempData)
            columnLen = len(settings)
            ROWS_START = ROWS_START+ROWS-rowsLen
            style.set_align('top')
            self.setMerge(worksheet, tempData, style, ROWS_START, rowsLen, COLUMN_START, columnLen, rows_check, column_check, rows_set)


def serialize_column_data_index(columns, **kwargs):
    cols = columns.copy()
    for key_, value in kwargs.items():
        for i, [_, data_index, _] in enumerate(cols):
            if data_index == key_:
                cols[i][1] = value
                break
    return cols

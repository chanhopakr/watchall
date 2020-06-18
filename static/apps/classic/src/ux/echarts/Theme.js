/**
 * Created by zen on 17. 2. 16.
 */

Ext.define(
  'apps.ux.echarts.Theme',
  {
    statics: {
      groupTooltipTemplate: new Ext.XTemplate(
        '<div style="font-weight:bold; margin-bottom:5px">{title}</div>',
        '<tpl for="groups">',
        '<div style="margin:3px 0; font-weight:bold">{text}</div>',
        '<tpl for="data">',
        '{marker} <b>{seriesName}</b>: {value}<br/>',
        '</tpl>',
        '</tpl>'
      ),
      tooltipTemplate: new Ext.XTemplate(
        '<div style="font-weight:bold">{title}</div>',
        '<tpl for="series">',
        '<div>',
        '<span class="chart_symbol" style="background-color: {color}"></span>',
        '<b>{seriesName}</b>: {[this.formatValue(values.data)]}',
        '</div>',
        '</tpl>',
        {
          formatValue: function(value) {
            if (typeof value === 'number') {
              return Ext.util.Format.number(value, '1,000.00');
            } else {
              return value;
            }
          }
        }
      ),
      tooltipTemplate2: new Ext.XTemplate(
        '<div style="font-weight:bold">{title}</div>',
        '<tpl for="series">',
        '<div style="width:650px">',
        '<div style="width:210px; margin:\'0 5px\'; float:left">',
        '<span class="chart_symbol" style="background-color: {color}"></span>',
        '<b>{seriesName}</b>: {[this.formatValue(values.data)]}',
        '</div>',
        '</div>',
        '</tpl>',
        {
          formatValue: function(value) {
            return Ext.util.Format.number(value, '1,000.00');
          }
        }
      ),
      dark: {
        // 全图默认背景
        backgroundColor: '#171717',

        // 默认色板
        color: [
          '#40AFE2',
          '#50B997',
          '#3D4373',
          '#7D1EC0',
          '#1D2DC3',
          '#7D1EC0'
        ],
        // color: [
        //     '#FE8463','#9BCA63','#FAD860','#60C0DD','#0084C6',
        //     '#D7504B','#C6E579','#26C0C0','#F0805A','#F4E001',
        //     '#B5C334'
        // ],

        // 图表标题
        title: {
          textStyle: {
            fontSize: '12',
            fontWeight: 'normal',
            color: '#fff' // 主标题文字颜色
          }
        },

        // 图例
        legend: {
          textStyle: {
            color: '#ccc' // 图例文字颜色
          }
        },

        // 值域
        dataRange: {
          itemWidth: 15,
          color: ['#FFF808', '#21BCF9'],
          textStyle: {
            color: '#ccc' // 值域文字颜色
          }
        },

        toolbox: {
          color: ['#fff', '#fff', '#fff', '#fff'],
          effectiveColor: '#FE8463',
          disableColor: '#666'
        },

        // 提示框
        tooltip: {
          backgroundColor: 'rgba(250,250,250,0.8)', // 提示背景颜色，默认为透明度为0.7的黑色
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: 'line', // 默认为直线，可选为：'line' | 'shadow'
            lineStyle: {
              // 直线指示器样式设置
              color: '#aaa'
            },
            crossStyle: {
              color: '#aaa'
            },
            shadowStyle: {
              // 阴影指示器样式设置
              color: 'rgba(200,200,200,0.2)'
            }
          },
          textStyle: {
            color: '#333'
          }
        },

        // 区域缩放控制器
        dataZoom: {
          dataBackgroundColor: '#555', // 数据背景颜色
          fillerColor: 'rgba(200,200,200,0.2)', // 填充颜色
          handleColor: '#eee' // 手柄颜色
        },

        // 网格
        grid: {
          show: true,
          top: 25,
          bottom: 25,
          borderWidth: 0,
          backgroundColor: '#000000'
        },

        // 类目轴
        timeAxis: {
          axisLine: {
            // 坐标轴线
            show: false
          },
          axisTick: {
            // 坐标轴小标记
            show: false
          },
          axisLabel: {
            color: '#eee'
            // ,
            // formatter:function(value){
            //     return Ext.Date.format(new Date(value), 'Y-m-d H:i');
            // }
          },
          splitLine: {
            // 分隔线
            show: false
          }
        },

        // 数值型坐标轴默认参数
        valueAxis: {
          axisLine: {
            // 坐标轴线
            show: false
          },
          axisTick: {
            // 坐标轴小标记
            show: false
          },
          axisLabel: { color: '#eee' },
          splitLine: {
            // 分隔线
            lineStyle: {
              // 属性lineStyle（详见lineStyle）控制线条样式
              color: '#141414'
            }
          },
          splitArea: {
            // 分隔区域
            show: false
          }
        },
        categoryAxis: {
          axisLabel: { color: '#eee' },
          splitLine: {
            // 分隔线
            lineStyle: {
              // 属性lineStyle（详见lineStyle）控制线条样式
              color: '#141414'
            }
          }
        },

        xAxis: {},

        yAxis: {},

        polar: {
          name: {
            textStyle: {
              // 其余属性默认使用全局文本样式，详见TEXTSTYLE
              color: '#ccc'
            }
          },
          axisLine: {
            // 坐标轴线
            lineStyle: {
              // 属性lineStyle控制线条样式
              color: '#ddd'
            }
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ['rgba(250,250,250,0.2)', 'rgba(200,200,200,0.2)']
            }
          },
          splitLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },

        timeline: {
          label: {
            textStyle: {
              color: '#ccc'
            }
          },
          lineStyle: {
            color: '#aaa'
          },
          controlStyle: {
            normal: { color: '#fff' },
            emphasis: { color: '#FE8463' }
          },
          symbolSize: 3
        },

        // 折线图默认参数
        line: {
          smooth: true,
          lineStyle: { width: 1 }
        },

        // K线图默认参数
        k: {
          itemStyle: {
            normal: {
              color: '#FE8463', // 阳线填充颜色
              color0: '#9BCA63', // 阴线填充颜色
              lineStyle: {
                width: 1,
                color: '#FE8463', // 阳线边框颜色
                color0: '#9BCA63' // 阴线边框颜色
              }
            }
          }
        },

        // 雷达图默认参数
        radar: {
          symbol: 'emptyCircle', // 图形类型
          symbolSize: 3
          //symbol: null,         // 拐点图形类型
          //symbolRotate : null,  // 图形旋转控制
        },

        pie: {
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            },
            emphasis: {
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 1)'
            }
          }
        },

        map: {
          itemStyle: {
            normal: {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              areaStyle: {
                color: '#ddd'
              },
              label: {
                textStyle: {
                  // color: '#ccc'
                }
              }
            },
            emphasis: {
              // 也是选中样式
              areaStyle: {
                color: '#FE8463'
              },
              label: {
                textStyle: {
                  // color: 'ccc'
                }
              }
            }
          }
        },

        force: {
          itemStyle: {
            normal: {
              linkStyle: {
                color: '#fff'
              }
            }
          }
        },

        chord: {
          itemStyle: {
            normal: {
              borderWidth: 1,
              borderColor: 'rgba(228, 228, 228, 0.2)',
              chordStyle: {
                lineStyle: {
                  color: 'rgba(228, 228, 228, 0.2)'
                }
              }
            },
            emphasis: {
              borderWidth: 1,
              borderColor: 'rgba(228, 228, 228, 0.9)',
              chordStyle: {
                lineStyle: {
                  color: 'rgba(228, 228, 228, 0.9)'
                }
              }
            }
          }
        },
        bar: {
          barCategoryGap: '40%'
        },

        gauge: {
          axisLine: {
            // 坐标轴线
            show: true, // 默认显示，属性show控制显示与否
            lineStyle: {
              // 属性lineStyle控制线条样式
              color: [[0.2, '#9BCA63'], [0.8, '#60C0DD'], [1, '#D7504B']],
              width: 3,
              shadowColor: '#fff', //默认透明
              shadowBlur: 10
            }
          },
          axisTick: {
            // 坐标轴小标记
            length: 15, // 属性length控制线长
            lineStyle: {
              // 属性lineStyle控制线条样式
              color: 'auto',
              shadowColor: '#fff', //默认透明
              shadowBlur: 10
            }
          },
          axisLabel: {
            // 坐标轴小标记
            textStyle: {
              // 属性lineStyle控制线条样式
              fontWeight: 'bolder',
              color: '#fff',
              shadowColor: '#fff', //默认透明
              shadowBlur: 10
            }
          },
          splitLine: {
            // 分隔线
            length: 25, // 属性length控制线长
            lineStyle: {
              // 属性lineStyle（详见lineStyle）控制线条样式
              width: 3,
              color: '#fff',
              shadowColor: '#fff', //默认透明
              shadowBlur: 10
            }
          },
          pointer: {
            // 分隔线
            shadowColor: '#fff', //默认透明
            shadowBlur: 5
          },
          title: {
            textStyle: {
              // 其余属性默认使用全局文本样式，详见TEXTSTYLE
              fontWeight: 'bolder',
              fontSize: 20,
              fontStyle: 'italic',
              color: '#fff',
              shadowColor: '#fff', //默认透明
              shadowBlur: 10
            }
          },
          detail: {
            shadowColor: '#fff', //默认透明
            shadowBlur: 5,
            offsetCenter: [0, '50%'], // x, y，单位px
            textStyle: {
              // 其余属性默认使用全局文本样式，详见TEXTSTYLE
              fontWeight: 'bolder',
              color: '#fff'
            }
          }
        },

        funnel: {
          itemStyle: {
            normal: {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              borderWidth: 1
            },
            emphasis: {
              borderColor: 'rgba(255, 255, 255, 1)',
              borderWidth: 1
            }
          }
        },

        textStyle: {
          fontFamily: 'Arial, Verdana, sans-serif'
        }
      },

      white: {
        backgroundColor: '#ffffff',
        grid: {
          show: true,
          borderWidth: 0,
          top: 25,
          bottom: 25,
          backgroundColor: '#ffffff'
        },
        categoryAxis: {
          axisLine: {
            // 坐标轴线
            show: false
          },
          axisTick: {
            // 坐标轴小标记
            show: false
          },
          axisLabel: {
            // 坐标轴文本标签，详见axis.axisLabel
            color: '#a0a0a0'
          },
          splitLine: {
            // 分隔线
            show: false
          }
        },

        // 数值型坐标轴默认参数
        valueAxis: {
          axisLine: {
            // 坐标轴线
            show: false
          },
          axisTick: {
            // 坐标轴小标记
            show: false
          },
          axisLabel: {
            // 坐标轴文本标签，详见axis.axisLabel
            color: '#a0a0a0'
          },
          splitLine: {
            // 分隔线
            show: false
          }
        },
        timeAxis: {
          axisLine: {
            // 坐标轴线
            show: false
          },
          axisTick: {
            // 坐标轴小标记
            show: false
          },
          axisLabel: {
            formatter: function(value) {
              return Ext.Date.format(new Date(value), 'H:i');
            }
          },
          splitLine: {
            // 分隔线
            show: false
          }
        },
        line: {
          //smooth : true,
          lineStyle: { width: 1 }
        }
      },

      zen: {
        grid: {
          left: 70,
          right: 10
        },
        legend: {
          type: 'scroll'
        },
        tooltip: {
          // formatter:function(series){
          //     if(_.isArray(series)){
          //         if(series.length > 6){
          //             return apps.ux.echarts.Theme.tooltipTemplate2.apply({title:series[0].axisValue, series:series})
          //         } else{
          //             return apps.ux.echarts.Theme.tooltipTemplate.apply({title:series[0].axisValue, series:series})
          //         }
          //     } else{
          //         return apps.ux.echarts.Theme.tooltipTemplate.apply({
          //             title:series.name,
          //             series:[{
          //                 color:series.color, seriesName:series.seriesName, data:series.data.value
          //             }]
          //         })
          //     }
          // }
        },
        title: {
          left: 'center',
          textStyle: {
            color: '#555',
            fontSize: 12
          }
        },
        toolbox: false,
        seriesCnt: '3',
        backgroundColor: 'rgba(252,252,252,0)',
        titleColor: '#666666',
        subtitleColor: '#999999',
        textColorShow: false,
        textColor: '#333',
        markTextColor: '#ffffff',
        // "color": [
        //     "#3fb1e3",
        //     "#6be6c1",
        //     "#626c91",
        //     "#a0a7e6",
        //     "#c4ebad",
        //     "#96dee8"
        // ],
        borderColor: '#ccc',
        borderWidth: 0,
        visualMapColor: ['#2a99c9', '#afe8ff'],
        legendTextColor: '#999999',
        kColor: '#e6a0d2',
        kColor0: 'transparent',
        kBorderColor: '#e6a0d2',
        kBorderColor0: '#3fb1e3',
        kBorderWidth: '2',
        lineWidth: '3',
        symbolSize: '8',
        symbol: 'emptyCircle',
        symbolBorderWidth: '2',
        lineSmooth: false,
        graphLineWidth: '1',
        graphLineColor: '#cccccc',
        mapLabelColor: '#ffffff',
        mapLabelColorE: 'rgb(63,177,227)',
        mapBorderColor: '#aaaaaa',
        mapBorderColorE: '#3fb1e3',
        mapBorderWidth: 0.5,
        mapBorderWidthE: 1,
        mapAreaColor: '#eeeeee',
        mapAreaColorE: 'rgba(63,177,227,0.25)',
        axes: [
          {
            type: 'all',
            name: '通用坐标轴',
            axisLineShow: true,
            axisLineColor: '#cccccc',
            axisTickShow: false,
            axisTickColor: '#333',
            axisLabelShow: true,
            axisLabelColor: '#999999',
            splitLineShow: true,
            splitLineColor: ['#eeeeee'],
            splitAreaShow: false,
            splitAreaColor: ['rgba(250,250,250,0.05)', 'rgba(200,200,200,0.02)']
          },
          {
            type: 'category',
            name: '类目坐标轴',
            axisLineShow: true,
            axisLineColor: '#333',
            axisTickShow: true,
            axisTickColor: '#333',
            axisLabelShow: true,
            axisLabelColor: '#333',
            splitLineShow: false,
            splitLineColor: ['#ccc'],
            splitAreaShow: false,
            splitAreaColor: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          },
          {
            type: 'value',
            name: '数值坐标轴',
            axisLineShow: true,
            axisLineColor: '#333',
            axisTickShow: true,
            axisTickColor: '#333',
            axisLabelShow: true,
            axisLabelColor: '#333',
            splitLineShow: true,
            splitLineColor: ['#ccc'],
            splitAreaShow: false,
            splitAreaColor: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          },
          {
            type: 'log',
            name: '对数坐标轴',
            axisLineShow: true,
            axisLineColor: '#333',
            axisTickShow: true,
            axisTickColor: '#333',
            axisLabelShow: true,
            axisLabelColor: '#333',
            splitLineShow: true,
            splitLineColor: ['#ccc'],
            splitAreaShow: false,
            splitAreaColor: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          },
          {
            type: 'time',
            name: '时间坐标轴',
            axisLineShow: true,
            axisLineColor: '#333',
            axisTickShow: true,
            axisTickColor: '#333',
            axisLabelShow: true,
            axisLabelColor: '#333',
            splitLineShow: true,
            splitLineColor: ['#ccc'],
            splitAreaShow: false,
            splitAreaColor: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)']
          }
        ],
        axisSeperateSetting: false,
        toolboxColor: '#999999',
        toolboxEmpasisColor: '#666666',
        tooltipAxisColor: '#cccccc',
        tooltipAxisWidth: 1,
        timelineLineColor: '#626c91',
        timelineLineWidth: 1,
        timelineItemColor: '#626c91',
        timelineItemColorE: '#626c91',
        timelineCheckColor: '#3fb1e3',
        timelineCheckBorderColor: 'rgba(63,177,227,0.15)',
        timelineItemBorderWidth: 1,
        timelineControlColor: '#626c91',
        timelineControlBorderColor: '#626c91',
        timelineControlBorderWidth: 0.5,
        timelineLabelColor: '#626c91',
        datazoomBackgroundColor: 'rgba(255,255,255,0)',
        datazoomDataColor: 'rgba(222,222,222,1)',
        datazoomFillColor: 'rgba(114,230,212,0.25)',
        datazoomHandleColor: '#cccccc',
        datazoomHandleWidth: '100',
        datazoomLabelColor: '#999999'
      }
    }
  },
  function() {
    echarts.registerTheme('dark', apps.ux.echarts.Theme.dark);
    echarts.registerTheme('white', apps.ux.echarts.Theme.white);
    echarts.registerTheme('zen', apps.ux.echarts.Theme.zen);
  }
);

SELECT f1.scanId, f1.monitorId, f2.scanId, f1.fileName FROM
 (SELECT scanId, monitorId, fileName 
	FROM files
	WHERE monitorId = '037b17637a2a4135a07d4674113941d3' and scanId = 2
    ) as f1
LEFT JOIN files AS f2 on ( f1.scanId + 1 = f2.scanId and f1.monitorId = f2.monitorId and f1.fileName = f2.fileName)
WHERE f2.scanId is NULL

